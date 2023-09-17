import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '39495070-5ff071e483d3b47d3211eb1ad';
const BASE_URL = 'https://pixabay.com/api/';
const perPage = 40;
let page = 1;
let currentQuery = '';
let isLoading = false; // Флаг, чтобы избежать параллельных запросов
let isEndOfResults = false; // Флаг, чтобы обозначить конец результатов

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');

form.addEventListener('submit', handleFormSubmit);

// Инициализация SimpleLightbox
const lightbox = new SimpleLightbox('.lightbox');

// Обработчик события прокрутки страницы
window.addEventListener('scroll', () => {
  if (isLoading || isEndOfResults) return;

  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 1000) {
    // Если пользователь прокрутил страницу близко к нижней части,
    // и нет активных запросов и еще есть результаты для загрузки
    loadMoreImages();
  }
});

async function handleFormSubmit(event) {
  event.preventDefault();
  gallery.innerHTML = '';
  page = 1;
  isEndOfResults = false; // Сбрасываем флаг окончания результатов
  const formData = new FormData(form);
  currentQuery = formData.get('searchQuery');
  await fetchImages(currentQuery);
}

async function fetchImages(query) {
  try {
    isLoading = true; // Устанавливаем флаг загрузки

    const response = await axios.get(`${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`);

    const data = response.data;
    const images = data.hits;

    if (images.length === 0) {
      isEndOfResults = true; // Устанавливаем флаг окончания результатов
      Notiflix.Notify.failure('Sorry, there are no more images matching your search query.');
      return;
    }

    const totalHits = data.totalHits;
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);

    renderImages(images);
    page++;
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('Oops! Something went wrong.');
  } finally {
    isLoading = false; // Сбрасываем флаг загрузки
  }
}

function renderImages(images) {
  const imageCards = images.map(image => createImageCard(image));
  gallery.insertAdjacentHTML('beforeend', imageCards.join(''));

  // Обновляем SimpleLightbox после добавления изображений
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
  if (isLoading || isEndOfResults) return;

  await fetchImages(currentQuery);
}