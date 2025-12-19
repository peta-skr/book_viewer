export type BookInfo = {
  id: number;
  title: string;
  pageCount: number;
  lastPageIndex: number;
  coverPath: string;
  folderPath: string;
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

export type CacheEntry = {
  objectUrl: string;
  mimeType: string;
};
