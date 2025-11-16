import type { BookInfo, ImageInfo } from "../types/book";

export {};

type AddFolderResult = {
  bookId: number;
  title: string;
  pageCount: number;
};

declare global {
  interface Window {
    mangata: {
      ping: () => string;
      pickFolder: () => Promise<string | null>;
      addFolder: (absPath: string) => Promise<AddFolderResult>;
      listFolder: () => Promise<BookInfo[] | null>;
      loadImage: (filePath: string) => Promise<string>;
      loadBook: (bookId: string) => Promise<ImageInfo[]>;
    };
  }
}
