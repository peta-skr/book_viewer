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
      pickFolder: () => Promise<string | null>;
      addFolder: (absPath: string, title: string) => Promise<AddFolderResult>;
      listFolder: () => Promise<BookInfo[] | null>;
      loadImage: (filePath: string) => Promise<string>;
      loadBook: (bookId: string, pageIndex: number) => Promise<ImagePayload>;
      updateLastPage: (bookId: string, pageIndex: number) => void;
      loadThumbnail: (bookId: string) => Promise<Uint8Array>;
      renameBook: (bookId: string, title: string) => boolean;
      removeBook: (bookId: string) => boolean;
      existBook: (absPath: string) => boolean;
      overwriteBook: (
        absPath: string,
        title: string
      ) => { ok: boolean; bookId: string };
    };
  }
}
