import { fetchImages } from './api.js';
import {
  initializeLightbox,
  showInfoNotification,
  showSuccessNotification,
  showFailureNotification,
} from './ui.js';

const perPage = 40;
let page = 1;
let currentQuery = '';
let isLoading = false;
let isEndOfResults = false;
let hasContentNotification = false;
let currentPage = 0;
let totalPageCount = 0;

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const lightbox = initializeLightbox();

form.addEventListener('submit', handleFormSubmit);

window.addEventListener('scroll', () => {
  if (isLoading || isEndOfResults || currentPage >= totalPageCount) return;

  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 1000) {
    loadMoreImages();
  }
});

async function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(form);
  currentQuery = formData.get('searchQuery');

  if (currentQuery.trim() === '') {
    showInfoNotification('Please enter a search query.');
    return;
  }

  gallery.innerHTML = '';
  page = 1;
  isEndOfResults = false;
  hasContentNotification = false;
  currentPage = 0;
  totalPageCount = 0;

  await fetchAndRenderImages(currentQuery);
}

async function fetchAndRenderImages(query) {
  try {
    isLoading = true;

    const data = await fetchImages(query, page, perPage);
    const images = data.hits;

    if (images.length === 0) {
      isEndOfResults = true;

      if (!hasContentNotification) {
        showFailureNotification('Sorry, there are no more images matching your search query.');
      }
      return;
    }

    totalPageCount = Math.ceil(data.totalHits / perPage);

    if (!hasContentNotification) {
      showSuccessNotification(`Hooray! We found ${data.totalHits} images.`);
      hasContentNotification = true;
    }

    renderImages(images);
    page++;
    currentPage++;
  } catch (error) {
    showFailureNotification('Oops! Something went wrong.');
  } finally {
    isLoading = false;
  }
}

function renderImages(images) {
  const imageCards = images.map(image => createImageCard(image));
  gallery.insertAdjacentHTML('beforeend', imageCards.join(''));

  lightbox.refresh();
}

function createImageCard(image) {
  return `
    <div class="photo-card">
      <a href="${image.largeImageURL}" class="lightbox">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes:</b> ${image.likes}
        </p>
        <p class="info-item">
          <b>Views:</b> ${image.views}
        </p>
        <p class="info-item">
          <b>Comments:</b> ${image.comments}
        </p>
        <p class="info-item">
          <b>Downloads:</b> ${image.downloads}
        </p>
      </div>
    </div>
  `;
}

async function loadMoreImages() {
  if (isLoading || isEndOfResults || currentPage >= totalPageCount) return;

  await fetchAndRenderImages(currentQuery);
}