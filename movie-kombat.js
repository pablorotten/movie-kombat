const movieInput = document.getElementById("movieInput");
const apiKeyInput = document.getElementById("apiKeyInput");
const movieInfoContainer = document.getElementById("movieInfo");
let typingTimeout;

// Attempt to load API key from localStorage
if (localStorage.getItem("omdbApiKey")) {
  apiKeyInput.value = localStorage.getItem("omdbApiKey");
}

async function fetchMovieInfo(title, apiKey) {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(title)}`
    );
    const movieData = await response.json();

    if (
      movieData.Response === "False" &&
      movieData.Error === "Invalid API key!"
    ) {
      throw new Error("Invalid API key. Please check your key and try again.");
    }

    if (!response.ok) throw new Error("Failed to fetch movie info");

    displayMovieInfo(movieData);
  } catch (error) {
    console.error("Error fetching movie info:", error);
    if (error.message.includes("Invalid API key")) {
      movieInfoContainer.innerHTML =
        "<p>Invalid API key. Please check your key and try again.</p>";
    } else {
      movieInfoContainer.innerHTML =
        "<p>Unable to fetch movie info. Please try again later.</p>";
    }
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
        movieInfoContainer.innerHTML = "<p>Please enter your OMDB API key.</p>";
      } else {
        movieInfoContainer.innerHTML = "";
      }
    }, 2000);
  } else {
    movieInfoContainer.innerHTML = "";
  }
});
