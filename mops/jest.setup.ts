// Jest setup file
// Note: @testing-library/jest-dom removed for React 19 compatibility

// Polyfills for Next.js Web APIs using Node.js built-ins
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream, TransformStream } from 'stream/web';
import { Blob, File } from 'buffer';

// Set up Web APIs
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
global.ReadableStream = ReadableStream as any;
global.TransformStream = TransformStream as any;
global.Blob = Blob as any;
global.File = File as any;

// Mock Headers with proper Map-like implementation
if (typeof global.Headers === 'undefined') {
  class HeadersPolyfill extends Map<string, string> {
    constructor(init?: any) {
      super();
      if (init) {
        if (init instanceof HeadersPolyfill || init instanceof Map) {
          for (const [key, value] of init.entries()) {
            this.set(key.toLowerCase(), String(value));
          }
        } else if (typeof init === 'object') {
          for (const [key, value] of Object.entries(init)) {
            this.set(key.toLowerCase(), String(value));
          }
        }
      }
    }
    
    append(name: string, value: string) {
      this.set(name.toLowerCase(), value);
    }
    
    delete(name: string): boolean {
      return super.delete(name.toLowerCase());
    }
    
    get(name: string): string | undefined {
      return super.get(name.toLowerCase()) || undefined;
    }
    
    has(name: string) {
      return super.has(name.toLowerCase());
    }
    
    set(name: string, value: string) {
      return super.set(name.toLowerCase(), value);
    }
  }
  
  global.Headers = HeadersPolyfill as any;
}

// Simple Request polyfill that works with NextRequest
if (typeof global.Request === 'undefined') {
  class RequestPolyfill {
    private _url: string;
    private _method: string;
    private _headers: any;
    private _body: any;
    
    constructor(input: string | RequestPolyfill, init: any = {}) {
      if (typeof input === 'string') {
        this._url = input;
      } else {
        this._url = input._url || input.url;
      }
      this._method = init.method || 'GET';
      this._headers = new (global.Headers as any)(init.headers || {});
      this._body = init.body || null;
    }
    
    get url() {
      return this._url;
    }
    
    get method() {
      return this._method;
    }
    
    get headers() {
      return this._headers;
    }
    
    get body() {
      return this._body;
    }
    
    async json() {
      if (typeof this._body === 'string') {
        return JSON.parse(this._body);
      }
      return this._body;
    }
    
    async text() {
      return String(this._body || '');
    }
    
    async formData() {
      const fd = new FormData();
      return fd;
    }
    
    clone() {
      return new RequestPolyfill(this._url, {
        method: this._method,
        headers: this._headers,
        body: this._body,
      });
    }
  }
  
  global.Request = RequestPolyfill as any;
}

// Mock Response if not available
if (typeof global.Response === 'undefined') {
  class ResponsePolyfill {
    body: any;
    init: any;
    headers: any;
    ok: boolean;
    status: number;
    statusText: string;
    
    constructor(body: any = null, init: any = {}) {
      this.body = body;
      this.init = init;
      this.headers = new (global.Headers as any)(init.headers || {});
      this.status = init.status || 200;
      this.statusText = init.statusText || 'OK';
      this.ok = this.status >= 200 && this.status < 300;
    }
    
    static json(data: any, init?: any) {
      return new ResponsePolyfill(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...(init?.headers || {}),
        },
      });
    }
    
    async json() {
      if (typeof this.body === 'string') {
        return JSON.parse(this.body);
      }
      return this.body;
    }
    
    async text() {
      return String(this.body || '');
    }
  }
  
  global.Response = ResponsePolyfill as any;
}

// Mock FormData if not available
if (typeof global.FormData === 'undefined') {
  class FormDataPolyfill {
    private data = new Map<string, any>();
    
    append(key: string, value: any) {
      this.data.set(key, value);
    }
    
    get(key: string) {
      return this.data.get(key);
    }
    
    has(key: string) {
      return this.data.has(key);
    }
    
    delete(key: string) {
      this.data.delete(key);
    }
    
    entries() {
      return this.data.entries();
    }
    
    keys() {
      return this.data.keys();
    }
    
    values() {
      return this.data.values();
    }
  }
  
  global.FormData = FormDataPolyfill as any;
}
