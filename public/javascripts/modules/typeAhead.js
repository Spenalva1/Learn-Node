import dompurify from 'dompurify';

const axios = require('axios');

function searchResultsHtml(stores) {
  return stores
    .map(
      store => `<a href="/store/${store.slug}" class="search__result">
            <strong>${store.name}</strong>
        </a>`
    )
    .join('');
}

function typeAhead(search) {
  if (!search) return;
  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function() {
    if (!this.value) {
      searchResults.style.display = 'none';
    }

    searchResults.style.display = 'block';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length)
          return (searchResults.innerHTML = dompurify.sanitize(
            searchResultsHtml(res.data)
          ));
        searchResults.innerHTML = dompurify.sanitize(
          `<div class="Search__result">No results for ${this.value} found</div>`
        );
      })
      .catch(err => console.error(err));
  });

  // Handle keyboards inputs
  searchInput.on('keyup', e => {
    if (![13, 40, 38].includes(e.keyCode)) return;

    // KEYDOWN
    if (e.keyCode === 40) {
      const active = searchResults.querySelector('.search__result--active');
      if (!active) {
        return searchResults.firstElementChild.classList.add(
          'search__result--active'
        );
      }

      active.classList.remove('search__result--active');

      const next = active.nextElementSibling;
      if (!next) {
        return searchResults.firstElementChild.classList.add(
          'search__result--active'
        );
      }
      next.classList.add('search__result--active');
    }

    // KEYUP
    if (e.keyCode === 38) {
      const active = searchResults.querySelector('.search__result--active');
      if (!active) {
        return searchResults.lastElementChild.classList.add(
          'search__result--active'
        );
      }

      active.classList.remove('search__result--active');

      const prev = active.previousElementSibling;
      if (!prev) {
        return searchResults.lastElementChild.classList.add(
          'search__result--active'
        );
      }
      prev.classList.add('search__result--active');
    }

    // ENTER
    if (e.keyCode === 13) {
      const active = searchResults.querySelector('.search__result--active');
      if (!active) return;
      window.location.href = active.href;
    }
  });
}

export default typeAhead;
