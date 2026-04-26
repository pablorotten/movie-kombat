import sys
import re

try:
    import cloudscraper  # Preferred: handles Cloudflare anti-bot
except ImportError:
    print("Missing dependency: 'cloudscraper'. Install it with: pip install cloudscraper")
    sys.exit(1)

from bs4 import BeautifulSoup

# Debug: set to True to print first chunk of fetched HTML
DEBUG = False


# Function to extract the movie data
def get_movie_info(url):
    # cloudscraper manages the headers and cookies needed to bypass bot detection
    scraper = cloudscraper.create_scraper()

    try:
        # Use the scraper instead of requests.get() and prefer Spanish responses
        headers = {'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'}
        response = scraper.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        if DEBUG:
            print('--- fetched html snippet ---')
            print(response.text[:1000])
            print('--- end snippet ---')

        def _norm(s):
            return re.sub(r'\s+', ' ', (s or '').strip().lower())

        # Try to find either Spanish or English label for original title
        original_title_dt = None
        for dt in soup.find_all('dt'):
            txt = _norm(dt.get_text())
            if re.search(r't[ií]tulo original|original title', txt):
                original_title_dt = dt
                break

        if original_title_dt:
            # find next sibling dd specifically
            title_dd = original_title_dt.find_next_sibling(lambda t: t.name == 'dd')
            if title_dd:
                direct_text = title_dd.find(text=True, recursive=False)
                if direct_text and direct_text.strip():
                    title = direct_text.strip()
                else:
                    title = title_dd.get_text(strip=True)
            else:
                title = 'Original Title Not Found'
        else:
            title_element = soup.select_one('h1#main-title span[itemprop="name"]')
            title = title_element.get_text(strip=True) if title_element else 'Title Not Found'

        return {'title': title}

    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return {'title': 'Error Fetching URL'}

# --- The rest of your script remains the same ---

# Step 1: Read links from the file called "links"
try:
    with open('links', 'r') as file:
        links = [line.strip() for line in file if line.strip()]
except FileNotFoundError:
    print("Error: 'links' file not found. Please create it and add your URLs.")
    links = []

# Step 2: Extract movie data for each link
if links:
    movies = [get_movie_info(link) for link in links]

    # Step 3: Write the movie data to a file called "movies"
    with open('movies', 'w', encoding='utf-8') as file:
        for movie in movies:
            file.write(f"{movie['title']}\n")

    print("Movie information has been successfully written to the 'movies' file.")
