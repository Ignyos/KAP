document.addEventListener('DOMContentLoaded', async function () {
  await AppInit.initialize();

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./service-worker.js').catch(function (error) {
      console.error('Service worker registration failed:', error);
    });
  }
});
