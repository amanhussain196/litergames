import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer'
import process from 'process'
import './index.css'
import App from './App.tsx'

// Polyfill for Simple-Peer
if (typeof window.global === 'undefined') window.global = window;
if (typeof window.process === 'undefined') window.process = process;
if (typeof window.Buffer === 'undefined') window.Buffer = Buffer;

// Ensure nextTick exists (critical for usage in readable-stream)
if (!window.process.nextTick) {
  (window.process as any).nextTick = (cb: any, ...args: any[]) => setTimeout(() => cb(...args), 0);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
