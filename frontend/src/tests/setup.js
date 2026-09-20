import '@testing-library/jest-dom';

// Global mocks for jsdom environment
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = () => '';
}

// Leaflet mock setup for jsdom
global.L = {
  map: () => ({
    setView: () => {},
    remove: () => {},
    fitBounds: () => {},
  }),
  geoJSON: () => ({
    getBounds: () => ({
      isValid: () => false,
    }),
  }),
  tileLayer: () => ({
    addTo: () => {},
  }),
};
