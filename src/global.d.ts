export {};

declare global {
  interface Window {
    mangata: {
      ping: () => string;
    };
  }
}
