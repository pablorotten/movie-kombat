window.onload = function () {
  const movieInput = document.getElementById("movieInput");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const movieInfoContainer = document.getElementById("movieInfo");
  const addMovieButton = document.getElementById("addMovieButton");
  const movieGrid = document.getElementById("movieGrid");
  let typingTimeout;

  let resultMovieData = {};

  document
    .getElementById("toggleApiKey")
    .addEventListener("click", function () {
      const apiKeyInput = document.getElementById("apiKeyInput");
      apiKeyInput.type = apiKeyInput.type === "password" ? "text" : "password";
    });

  // Load API key from localStorage
  if (localStorage.getItem("omdbApiKey")) {
    apiKeyInput.value = localStorage.getItem("omdbApiKey");
  }

  async function fetchMovieInfo(title, apiKey) {
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(
          title
        )}`
      );
      const movieData = await response.json();

      if (
        movieData.Response === "False" &&
        movieData.Error === "Invalid API key!"
      ) {
        throw new Error(
          "Invalid API key. Please check your key and try again."
        );
      }

      if (!response.ok) throw new Error("Failed to fetch movie info");

      displayMovieInfo(movieData);
    } catch (error) {
      console.error("Error fetching movie info:", error);
      movieInfoContainer.innerHTML = error.message.includes("Invalid API key")
        ? "<p>Invalid API key. Please check your key and try again.</p>"
        : "<p>Unable to fetch movie info. Please try again later.</p>";
    }
  }

  async function displayMovieInfo(movieData) {
    try {
      const response = await fetch("movie-info.html");
      const template = await response.text();

      movieInfoContainer.innerHTML = template;

      document.getElementById("moviePoster").src = movieData.Poster;
      document.getElementById("moviePoster").alt = `${movieData.Title} Poster`;
      document.getElementById(
        "movieTitle"
      ).innerText = `${movieData.Title} (${movieData.Year})`;
      document.getElementById("movieGenre").innerText = movieData.Genre;
      document.getElementById("movieDirector").innerText = movieData.Director;
      document.getElementById("movieActors").innerText = movieData.Actors;
      document.getElementById("moviePlot").innerText = movieData.Plot;
      document.getElementById("movieRating").innerText = movieData.imdbRating;
      document.getElementById(
        "movieLink"
      ).href = `https://www.imdb.com/title/${movieData.imdbID}`;
      document.getElementById("movieLink").innerText = "View on IMDB";
      resultMovieData.Title = movieData.Title;
      resultMovieData.Poster = movieData.Poster;
    } catch (error) {
      console.error("Error loading movie info template:", error);
      movieInfoContainer.innerHTML = "<p>Failed to load movie details.</p>";
    }
  }

  async function addMovieToGrid() {
    const moviePoster = resultMovieData.Poster;
    const movieTitle = resultMovieData.Title;

    if (!moviePoster || !movieTitle) {
      alert("No movie found. Please search for a movie first.");
      return;
    }

    // Fetch the movie card template
    const response = await fetch("movie-card.html");
    const movieCardTemplate = await response.text();

    // Create a temporary div and insert the template
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = movieCardTemplate;
    const movieCard = tempDiv.firstElementChild;

    // Update movie card content
    movieCard.querySelector("h3").innerText = movieTitle;
    movieCard.querySelector("img").src = moviePoster;
    movieCard.querySelector("img").alt = `${movieTitle} Poster`;

    // Append to movie grid
    movieGrid.appendChild(movieCard);
    resultMovieData.Title = movieTitle;
    resultMovieData.Poster = moviePoster;

    // Clear the movie info container
    movieInfoContainer.innerHTML = "";
    movieInput.value = "";
    movieInput.focus();
  }

  apiKeyInput.addEventListener("input", () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      localStorage.setItem("omdbApiKey", apiKey);
    }
  });

  movieInput.addEventListener("input", () => {
    const title = movieInput.value.trim();
    const apiKey = apiKeyInput.value.trim();

    clearTimeout(typingTimeout);

    if (title) {
      movieInfoContainer.innerHTML = "<p>Loading...</p>";
      typingTimeout = setTimeout(() => {
        if (apiKey && title) {
          fetchMovieInfo(title, apiKey);
        } else if (!apiKey) {
          movieInfoContainer.innerHTML =
            "<p>Please enter your OMDB API key.</p>";
        } else {
          movieInfoContainer.innerHTML = "";
        }
      }, 2000);
    } else {
      movieInfoContainer.innerHTML = "";
    }
  });

  addMovieButton.addEventListener("click", addMovieToGrid);
  movieInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addMovieToGrid();
    }
  });
};

function toggleAccordion(index) {
  const content = document.getElementById(`content-${index}`);
  const icon = document.getElementById(`icon-${index}`);

  // SVG for Down icon
  const downSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4">
        <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
      </svg>
    `;

  // SVG for Up icon
  const upSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4">
        <path fill-rule="evenodd" d="M11.78 9.78a.75.75 0 0 1-1.06 0L8 7.06 5.28 9.78a.75.75 0 0 1-1.06-1.06l3.25-3.25a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06Z" clip-rule="evenodd" />
      </svg>
    `;

  // Toggle the content's max-height for smooth opening and closing
  if (content.style.maxHeight && content.style.maxHeight !== "0px") {
    content.style.maxHeight = "0";
    icon.innerHTML = upSVG;
  } else {
    content.style.maxHeight = content.scrollHeight + "px";
    icon.innerHTML = downSVG;
  }
}
