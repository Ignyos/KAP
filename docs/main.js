function ensureManifestLink() {
  var isHttpLike = window.location.protocol === 'http:' || window.location.protocol === 'https:';
  if (!isHttpLike) {
    return;
  }

  if (document.querySelector('link[rel="manifest"]')) {
    return;
  }

  var link = document.createElement('link');
  link.rel = 'manifest';
  link.href = './manifest.webmanifest';
  document.head.appendChild(link);
}

document.addEventListener('DOMContentLoaded', async function () {
  ensureManifestLink();
  await AppInit.initialize();

  var supportsServiceWorker = 'serviceWorker' in navigator;
  var isSupportedProtocol = window.location.protocol === 'http:' || window.location.protocol === 'https:';
  if (supportsServiceWorker && isSupportedProtocol && window.isSecureContext) {
    navigator.serviceWorker.register('./service-worker.js').catch(function (error) {
      console.error('Service worker registration failed:', error);
    });
  }
});
