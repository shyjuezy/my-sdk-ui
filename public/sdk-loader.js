// Load the SDK as a global script
const script = document.createElement('script');
script.src = '/lib/vecu-idv-web-sdk/dist/index.umd.js';
script.onload = () => {
  window.VecuIDVLoaded = true;
  window.dispatchEvent(new Event('vecuIdvReady'));
};
script.onerror = () => {
  console.error('Failed to load VECU IDV SDK');
};
document.head.appendChild(script);