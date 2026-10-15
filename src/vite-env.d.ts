/// <reference types="vite/client" />

import { KickstartAPI } from '../electron/preload';

declare global {
  interface Window {
    api: KickstartAPI;
  }
}
