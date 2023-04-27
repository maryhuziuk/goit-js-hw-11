import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');

const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captions: true,
  captionsData: 'alt',
});

let page = 1;
let perPage = 40;
let query = '';

searchForm.addEventListener('submit', onSearchForm);

function onSearchForm(event) {
  event.preventDefault();

  query = event.target.elements.searchQuery.value.trim();
  page = 1;

  clearGallery();
  searchImages(page);
}

function searchImages() {
  Notiflix.Loading.dots('Loading...');

  axios
    .get('/api', {
      params: {
        key: '35823883-f26519cd3efcd4788cefc8848',
        q: query,
        page: page,
        per_page: perPage,
      },
    })
    .then(function (response) {
      // handle success
      console.log(response);
      gallery.insertAdjacentHTML('beforeend', renderImg(response.data.hits));
      Notiflix.Loading.remove();
      if (response.data.totalHits > (page - 1) * perPage) {
        lightbox.refresh();
      } else if (response.data.totalHits == 0)
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      else {
        Notiflix.Notify.info(
          `Hooray! We found ${response.data.totalHits} images.`
        );
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error);
      Notiflix.Notify.failure(
        'Failed to fetch images. Please try again later.'
      );
      Notiflix.Loading.remove();
    });
}

function renderImg(images) {
  if (!images) {
    return;
  }

  const markup = images
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
      <a class="gallery__link" href="${largeImageURL}">
              <div class="gallery-item" ">
                <img
                  class="gallery-item__img"
                  src="${webformatURL}"
                  alt="${tags}"
                  loading="lazy"
                />
                <div class="info">
                  <p class="info-item">
                    <b>Likes</b>${likes}
                  </p>
                  <p class="info-item">
                    <b>Views</b>${views}
                  </p>
                  <p class="info-item">
                    <b>Comments</b>${comments}
                  </p>
                  <p class="info-item">
                    <b>Downloads</b>${downloads}
                  </p>
                </div>
              </div>
            </a>`;
      }
    )
    .join('');

  return markup;
}

function clearGallery() {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = '';
}

window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 5) {
    page++;
    searchImages();
  }
});
