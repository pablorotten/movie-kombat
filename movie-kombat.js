window.onload = function () {
  const movieInput = document.getElementById("movieInput");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const movieInfoContainer = document.getElementById("movieInfo");
  const addMovieButton = document.getElementById("addMovieButton");
  const movieGrid = document.getElementById("movieGrid");
  let typingTimeout;

  // Add movies placeholder



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

  function displayMovieInfo(movieData) {
    if (movieData.Response === "True") {
      movieInfoContainer.innerHTML = `
        <img src="${movieData.Poster}" alt="${movieData.Title} Poster">
        <h2>${movieData.Title} (${movieData.Year})</h2>
        <p><strong>Genre:</strong> ${movieData.Genre}</p>
        <p><strong>Director:</strong> ${movieData.Director}</p>
        <p><strong>Actors:</strong> ${movieData.Actors}</p>
        <p><strong>Plot:</strong> ${movieData.Plot}</p>
        <p><strong>IMDB Rating:</strong> ${movieData.imdbRating}</p>
        <p><a href="https://www.imdb.com/title/${movieData.imdbID}" target="_blank">https://www.imdb.com/title/${movieData.imdbID}</a></p>
      `;
    } else {
      movieInfoContainer.innerHTML =
        "<p>Movie not found. Please check the title.</p>";
    }
  }

  async function addMovieToGrid() {
    const moviePoster = movieInfoContainer.querySelector("img")?.src;
    const movieTitle = movieInfoContainer.querySelector("h2")?.innerText;

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
