"use strict";

document.addEventListener("DOMContentLoaded", initApp);

/*comment for at  kunne comitte*/

const GAMES_URL =
  "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json";
let allGames = [];

function initApp() {
  document
    .querySelector("#search-input")
    .addEventListener("input", applyFiltersAndSort);
  document
    .querySelector("#genre-select")
    .addEventListener("change", applyFiltersAndSort);
  document
    .querySelector("#sort-select")
    .addEventListener("change", applyFiltersAndSort);

  getGames();
}

async function getGames() {
  const response = await fetch(GAMES_URL);
  allGames = await response.json();

  populateGenreSelect();
  applyFiltersAndSort();
  showPopularGames();
}

function populateGenreSelect() {
  const genreSelect = document.querySelector("#genre-select");
  const genres = new Set();

  for (const game of allGames) {
    genres.add(game.genre);
  }

  const genreArray = Array.from(genres);
  genreArray.sort((genreA, genreB) => genreA.localeCompare(genreB));

  for (const genre of genreArray) {
    genreSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${genre}">${genre}</option>`,
    );
  }
}

function applyFiltersAndSort() {
  const searchValue = document
    .querySelector("#search-input")
    .value.trim()
    .toLowerCase();
  const selectedGenre = document.querySelector("#genre-select").value;
  const sortOption = document.querySelector("#sort-select").value;

  let filteredGames = allGames.filter(function (game) {
    const matchesTitle = game.title.toLowerCase().includes(searchValue);
    const matchesGenre =
      selectedGenre === "all" || game.genre === selectedGenre;

    return matchesTitle && matchesGenre;
  });

  if (sortOption === "title") {
    filteredGames.sort((gameA, gameB) =>
      gameA.title.localeCompare(gameB.title),
    );
  } else if (sortOption === "rating") {
    filteredGames.sort((gameA, gameB) => gameB.rating - gameA.rating);
  } else if (sortOption === "playtime") {
    filteredGames.sort((gameA, gameB) => gameA.playtime - gameB.playtime);
  } else if (sortOption === "age") {
    filteredGames.sort((gameA, gameB) => gameA.age - gameB.age);
  }

  showGames(filteredGames);
}

function showGames(games) {
  const gameList = document.querySelector("#movie-list");
  const gameCount = document.querySelector("#movie-count");

  gameList.innerHTML = "";
  gameCount.textContent = `Viser ${games.length} ud af ${allGames.length} spil`;

  if (games.length === 0) {
    gameList.innerHTML =
      '<p class="empty">Ingen spil matcher din søgning eller genre.</p>';
    return;
  }

  for (const game of games) {
    showGame(game);
  }
}
function showPopularGames() {
  const popularGamesContainer = document.querySelector("#popular-games");

  const popularGames = allGames
    .filter((game) => game.rating > 4.2)
    .sort((gameA, gameB) => gameB.rating - gameA.rating)
    .slice(0, 4);

  popularGamesContainer.innerHTML = "";

  for (const game of popularGames) {
    const gameCard = /*html*/ `
      <article class="movie-card popular-card" tabindex="0">
        <img src="${game.image}" alt="Billede af ${game.title}" class="movie-poster" />
        <div class="movie-info">
          <div class="title-row">
            <h2>${game.title}</h2>
            <span class="year-badge">${game.age}+</span>
          </div>
          <p class="genre">${game.genre}</p>
          <p class="movie-rating">⭐ ${game.rating}</p>
          <p><strong>Spilletid:</strong> ${game.playtime} min.</p>
        </div>
      </article>
    `;

    popularGamesContainer.insertAdjacentHTML("beforeend", gameCard);
  }

  const cards = popularGamesContainer.querySelectorAll(".movie-card");
  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      showGameDialog(popularGames[index]);
    });
  });
}

function showGame(game) {
  const gameCard = /*html*/ `
    <article class="movie-card" tabindex="0">
      <img src="${game.image}" alt="Billede af ${game.title}" class="movie-poster" />
      <div class="movie-info">
        <div class="title-row">
          <h2>${game.title}</h2>
          <span class="year-badge">${game.age}+</span>
        </div>
        <p class="genre">${game.genre}</p>
        <p class="movie-rating">⭐ ${game.rating}</p>
        <p><strong>Spilletid:</strong> ${game.playtime} min.</p>
        <p><strong>Spillere:</strong> ${game.players.min}-${game.players.max}</p>
        <p><strong>Sværhedsgrad:</strong> ${game.difficulty}</p>
      </div>
    </article>
  `;

  const gameList = document.querySelector("#movie-list");
  gameList.insertAdjacentHTML("beforeend", gameCard);

  const newCard = gameList.lastElementChild;
  newCard.addEventListener("click", function () {
    showGameDialog(game);
  });
}

function showGameDialog(game) {
  const dialog = document.querySelector("#movie-dialog");
  const dialogContent = document.querySelector("#dialog-content");

  dialogContent.innerHTML = /*html*/ `
    <img src="${game.image}" alt="Billede af ${game.title}" class="movie-poster">
    <div class="dialog-details">
      <h2>${game.title}</h2>
      <p class="movie-genre">${game.genre}</p>
      <p class="movie-rating">⭐ ${game.rating}</p>
      <p><strong>Beskrivelse:</strong> ${game.description}</p>
      <p><strong>Spilletid:</strong> ${game.playtime} min.</p>
      <p><strong>Spillere:</strong> ${game.players.min}-${game.players.max}</p>
      <p><strong>Sprog:</strong> ${game.language}</p>
      <p><strong>Alder:</strong> ${game.age}+</p>
      <p><strong>Sværhedsgrad:</strong> ${game.difficulty}</p>
      <p><strong>Lokation:</strong> ${game.location}</p>
      <p><strong>Hylde:</strong> ${game.shelf}</p>
      <p><strong>Status:</strong> ${game.available ? "Tilgængelig" : "Ikke tilgængelig"}</p>
      <p class="movie-description"><strong>Regler:</strong> ${game.rules}</p>
    </div>
  `;

  dialog.showModal();
}