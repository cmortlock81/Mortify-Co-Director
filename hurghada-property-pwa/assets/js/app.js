(function () {
  const config = window.HPPWA || {};
  const savedKey = 'hppwa_saved_properties';
  const readSaved = () => JSON.parse(localStorage.getItem(savedKey) || '[]');
  const writeSaved = (items) => localStorage.setItem(savedKey, JSON.stringify(items));

  function whatsappUrl(title, url) {
    const template = config.template || 'Hi, I am interested in {title} ({url}).';
    const message = template.replace('{title}', title || document.title).replace('{url}', url || window.location.href);
    return 'https://wa.me/' + (config.whatsapp || '') + '?text=' + encodeURIComponent(message);
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
    savedList.innerHTML = items.length
      ? items.map((property) => `<article class="hppwa-property-card"><img src="${property.image}" alt=""><div><strong>${property.title}</strong><span class="price">${property.price || ''}</span><p>${property.location || ''}</p><div class="actions"><a class="hppwa-button" href="${property.url}">View Details</a><button class="hppwa-save-remove" data-id="${property.id}">Remove</button></div></div></article>`).join('')
      : '<div class="hppwa-card">No saved properties yet.</div>';

    savedList.addEventListener('click', function (event) {
      const removeButton = event.target.closest('.hppwa-save-remove');
      if (removeButton) {
        writeSaved(readSaved().filter((property) => String(property.id) !== String(removeButton.dataset.id)));
        window.location.reload();
      }
    });
  }
}());
