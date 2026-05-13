/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="@testing-library/jest-dom" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: "test" | "uat" | "live" | "development";
  readonly VITE_ENABLE_ANALYTICS?: "true" | "false";
  readonly VITE_ENABLE_QUICKLINK?: "true" | "false";
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}
