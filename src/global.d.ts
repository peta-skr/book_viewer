import type { BookInfo, ImageInfo, ImagePayload } from "../types/book";

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
      loadBook: (bookId: string, pageIndex: number) => Promise<ImagePayload>;
      updateLastPage: (bookId: string, pageIndex: number) => void;
      loadThumbnail: (bookId: string) => Promise<Uint8Array>;
    };
  }
}
