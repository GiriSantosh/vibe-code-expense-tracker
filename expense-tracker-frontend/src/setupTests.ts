import '@testing-library/jest-dom';
import 'regenerator-runtime/runtime';

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock CSS supports function for Highcharts
Object.defineProperty(CSS, 'supports', {
  writable: true,
  value: jest.fn(() => false),
});

// Mock Highcharts 
jest.mock('highcharts', () => ({
  chart: jest.fn(),
  setOptions: jest.fn(),
}));

jest.mock('highcharts-react-official', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));
