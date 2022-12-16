import { Notify } from 'notiflix';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Fetch } from './js/fetch';
const refs = {
  gallery: document.querySelector('.gallery'),
  form: document.querySelector('#search-form'),
  loadMoreBtn: document.querySelector('.btn-load'),
};
const lightbox = new simpleLightbox('.gallery a', {
  captions: true,
  captionPosition: 'bottom',
  captionsData: 'alt',
  captionDelay: 250,
});
lightbox.on('show.simplelightbox');
const fetching = new Fetch();
const onSearch = e => {
  e.preventDefault();
  refs.gallery.innerHTML = '';
  fetching.query = e.currentTarget.elements[0].value.trim();
  fetching.page = 1;
  fetchImagesFunc();
  refs.loadMoreBtn.classList.remove('is-hidden');
};

const createMArkup = data => {
  return data
    .map(el => {
      const {
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = el;
      return `
      <a class="photo-card__link" href="${largeImageURL}"><div class="photo-card">
  <img class="photo-card__image" src="${webformatURL}" alt="${tags}" loading="lazy"/>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
</div>
</a>`;
    })
    .join('');
};
const addMArkup = arr => {
  refs.gallery.insertAdjacentHTML('beforeend', arr);
};
const pageScroll = () => {
  const { height: cardHeight } =
    refs.gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};

const fetchImagesFunc = async () => {
  try {
    const images = await fetching.fetchImages();
    if (images.totalHits === 0) {
      refs.loadMoreBtn.classList.add('is-hidden');
      Notify.failure(
        `Sorry, there are no images matching your search query. Please try again.`
      );
      return;
    }
    const { hits, totalHits } = images;
    addMArkup(createMArkup(hits));
    pageScroll();
    lightbox.refresh();
    Notify.success(`Hooray! We found ${totalHits} images.`);
  } catch {
    Notify.failure(
      `Sorry, there are no images matching your search query. Please try again.`
    );
  }
};

refs.form.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', fetchImagesFunc);
