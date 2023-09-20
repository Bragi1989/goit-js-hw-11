import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

export function initializeLightbox() {
  return new SimpleLightbox('.lightbox');
}

export function showInfoNotification(message) {
  Notiflix.Notify.info(message);
}

export function showSuccessNotification(message) {
  Notiflix.Notify.success(message);
}

export function showFailureNotification(message) {
  Notiflix.Notify.failure(message);
}