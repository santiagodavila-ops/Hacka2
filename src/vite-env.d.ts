/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Opcionales: prellenan el formulario de login para pruebas (gitignorado).
  readonly VITE_DEFAULT_TEAM_CODE?: string;
  readonly VITE_DEFAULT_EMAIL?: string;
  readonly VITE_DEFAULT_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
