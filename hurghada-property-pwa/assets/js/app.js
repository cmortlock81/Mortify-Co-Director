(function () {
  const config = window.HPPWA || {};
  const savedKey = 'hppwa_saved_properties';

  function readSaved() {
    try {
      const parsed = JSON.parse(localStorage.getItem(savedKey) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeSaved(items) {
    localStorage.setItem(savedKey, JSON.stringify(items));
  }

  function whatsappUrl(title, url) {
    const template = config.template || 'Hi, I am interested in {title} ({url}).';
    const message = template.replace('{title}', title || document.title).replace('{url}', url || window.location.href);
    return 'https://wa.me/' + (config.whatsapp || '') + '?text=' + encodeURIComponent(message);
  }

  function appendText(parent, tagName, value, className) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    element.textContent = value || '';
    parent.appendChild(element);
    return element;
  }

  function renderSavedProperty(property) {
    const article = document.createElement('article');
    article.className = 'hppwa-property-card';

    const image = document.createElement('img');
    image.src = property.image || '';
    image.alt = property.title || '';
    article.appendChild(image);

    const content = document.createElement('div');
    appendText(content, 'strong', property.title || 'Saved property');
    appendText(content, 'span', property.price || '', 'price');
    appendText(content, 'p', property.location || '');

    const actions = document.createElement('div');
    actions.className = 'actions';

    const details = document.createElement('a');
    details.className = 'hppwa-button';
    details.href = property.url || '#';
    details.textContent = 'View Details';
    actions.appendChild(details);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'hppwa-save-remove';
    remove.dataset.id = property.id || '';
    remove.textContent = 'Remove';
    actions.appendChild(remove);

    content.appendChild(actions);
    article.appendChild(content);
    return article;
  }

  document.addEventListener('click', function (event) {
    const saveButton = event.target.closest('.hppwa-save');
    if (saveButton) {
      const card = saveButton.closest('[data-property]');
      if (card) {
        const property = JSON.parse(card.dataset.property);
        const items = readSaved().filter((item) => item.id !== property.id);
        items.unshift(property);
        writeSaved(items);
        saveButton.textContent = 'Saved';
      }
    }

    const whatsappButton = event.target.closest('.hppwa-whatsapp');
    if (whatsappButton) {
      event.preventDefault();
      window.location.href = whatsappUrl(whatsappButton.dataset.title, whatsappButton.dataset.url);
    }
  });

  const savedList = document.getElementById('hppwa-saved-list');
  if (savedList) {
    const items = readSaved();
    savedList.replaceChildren();

    if (items.length) {
      items.forEach((property) => savedList.appendChild(renderSavedProperty(property)));
    } else {
      const empty = document.createElement('div');
      empty.className = 'hppwa-card';
      empty.textContent = 'No saved properties yet.';
      savedList.appendChild(empty);
    }

    savedList.addEventListener('click', function (event) {
      const removeButton = event.target.closest('.hppwa-save-remove');
      if (removeButton) {
        writeSaved(readSaved().filter((property) => String(property.id) !== String(removeButton.dataset.id)));
        window.location.reload();
      }
    });
  }
}());
