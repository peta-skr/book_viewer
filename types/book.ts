export type BookInfo = {
  id: number;
  title: string;
  pageCount: number;
  lastPageIndex: number;
  coverPath: string;
  folderPath: string;
  mimeType: string;
  createdAt: number;
};

export type ImageInfo = {
  id: number;
  bookId: number;
  imagePath: string;
  pageOrder: number;
  mimeType: string;
};

export type ImagePayload = {
  info: ImageInfo;
  bytes: Uint8Array;
};

export type BookPayload = {
  info: BookInfo;
  bytes: Uint8Array;
};

export type CacheEntry = {
  objectUrl: string;
  mimeType: string;
};

export type LibraryInfo = {
  id: string;
  title: string;
  folderPath?: string;
};

export type LibrarySortValue =
  | "title_asc"
  | "title_desc"
  | "created_desc"
  | "created_asc";
