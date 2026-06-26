(function () {
  const config = window.HPPWAInstall || {};
  const dismissedKey = 'hppwa_install_dismissed';
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  if (isStandalone || localStorage.getItem(dismissedKey) === '1') {
    return;
  }

  if ('serviceWorker' in navigator && config.serviceWorkerUrl) {
    navigator.serviceWorker.register(config.serviceWorkerUrl, { scope: '/' }).catch(function () {});
  }

  function text(value, fallback) {
    return String(value || fallback || '');
  }

  function button(className, label) {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = className;
    element.textContent = label;
    return element;
  }

  function createBanner(mode, promptEvent) {
    if (document.querySelector('.hppwa-install')) {
      return;
    }

    const banner = document.createElement('div');
    banner.className = 'hppwa-install hppwa-install--visible';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');

    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = text(config.appName, 'Hurghada Property PWA');

    const body = document.createElement('span');
    body.textContent = mode === 'ios'
      ? 'Tap Share, then Add to Home Screen.'
      : 'Install the mobile property app for faster access.';

    copy.append(title, body);

    const actions = document.createElement('div');
    actions.className = 'hppwa-install__actions';

    if (mode === 'android' && promptEvent) {
      actions.appendChild(button('hppwa-install__install', 'Install'));
    } else {
      const open = document.createElement('a');
      open.className = 'hppwa-install__open';
      open.href = text(config.startUrl, '/app/');
      open.textContent = 'Open App';
      actions.appendChild(open);
    }

    const dismiss = button('hppwa-install__dismiss', 'Not now');
    dismiss.setAttribute('aria-label', 'Dismiss install prompt');
    actions.appendChild(dismiss);
    banner.append(copy, actions);
    document.body.appendChild(banner);

    banner.addEventListener('click', function (event) {
      if (event.target.closest('.hppwa-install__dismiss')) {
        localStorage.setItem(dismissedKey, '1');
        banner.remove();
      }

      if (promptEvent && event.target.closest('.hppwa-install__install')) {
        promptEvent.prompt();
        promptEvent.userChoice.finally(function () {
          banner.remove();
        });
      }
    });
  }

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    createBanner('android', event);
  });

  if (config.showFallback) {
    window.setTimeout(function () {
      createBanner('fallback');
    }, 1200);
  }

  window.addEventListener('appinstalled', function () {
    localStorage.setItem(dismissedKey, '1');
    const banner = document.querySelector('.hppwa-install');
    if (banner) {
      banner.remove();
    }
  });

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) {
    window.setTimeout(function () {
      createBanner('ios');
    }, 900);
  }
}());
