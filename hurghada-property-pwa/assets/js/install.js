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

  function createBanner(mode, promptEvent) {
    if (document.querySelector('.hppwa-install')) {
      return;
    }

    const banner = document.createElement('div');
    banner.className = 'hppwa-install hppwa-install--visible';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');

    const title = config.appName || 'Hurghada Property PWA';
    const iosHelp = 'Tap Share, then Add to Home Screen.';
    const body = mode === 'ios' ? iosHelp : 'Install the mobile property app for faster access.';
    const primary = mode === 'android' ? '<button type="button" class="hppwa-install__install">Install</button>' : '<a class="hppwa-install__open" href="' + (config.startUrl || '/app/') + '">Open App</a>';

    banner.innerHTML = '<div><strong>' + title + '</strong><span>' + body + '</span></div><div class="hppwa-install__actions">' + primary + '<button type="button" class="hppwa-install__dismiss" aria-label="Dismiss install prompt">Not now</button></div>';
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
