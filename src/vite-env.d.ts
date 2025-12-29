/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BEEHIVE_PUBLIC_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
