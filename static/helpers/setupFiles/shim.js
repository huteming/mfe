require('core-js/stable')
require('regenerator-runtime/runtime')
const Enzyme = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')

Enzyme.configure({ adapter: new Adapter() })

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

if (typeof window !== 'undefined') {
  require('whatwg-fetch')
}
