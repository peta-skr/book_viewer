// src/renderer/services/mangataClient.ts
import type { BookInfo } from "../../types/book";

export type OverwriteResult = { ok: boolean; reason?: string };

type AddFolderResult = {
  bookId: number;
  title: string;
  pageCount: number;
};

export interface MangataClient {
  listFolder(): Promise<BookInfo[]>;
  pickFolder(): Promise<string | null>;
  existBook(folderPath: string): Promise<boolean>;
  addFolder(folderPath: string, title: string): Promise<AddFolderResult>;
  overwriteBook(folderPath: string, title: string): Promise<OverwriteResult>;
  renameBook(bookId: string, title: string): Promise<boolean>;
  removeBook(bookId: string): Promise<boolean>;
}

/**
 * window.mangata を直接触らないように、ここに閉じ込める
 */
export const mangataClient: MangataClient = {
  async listFolder() {
    return (await window.mangata.listFolder()) ?? [];
  },
  async pickFolder() {
    return (await window.mangata.pickFolder()) ?? null;
  },
  async existBook(folderPath: string) {
    return await window.mangata.existBook(folderPath);
  },
  async addFolder(folderPath: string, title: string) {
    return await window.mangata.addFolder(folderPath, title);
  },
  async overwriteBook(folderPath: string, title: string) {
    return await window.mangata.overwriteBook(folderPath, title);
  },
  async renameBook(bookId: string, title: string) {
    return await window.mangata.renameBook(bookId, title);
  },
  async removeBook(bookId: string) {
    return await window.mangata.removeBook(bookId);
  },
};
