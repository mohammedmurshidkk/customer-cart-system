import '@testing-library/jest-dom'
import 'whatwg-fetch'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

class MockHeaders extends Map {
  append(name, value) {
    this.set(name, value)
  }
  get(name) {
    return super.get(name) || null
  }
}

class MockResponse {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.ok = this.status >= 200 && this.status < 300
    this.headers = new MockHeaders()
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }

  static json(data, init = {}) {
    return new MockResponse(data, init)
  }
}

Object.defineProperties(globalThis, {
  Response: { value: MockResponse },
  Headers: { value: MockHeaders },
})
