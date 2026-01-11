export function folderBaseName(folder: string) {
  return folder.split(/[\\]/).filter(Boolean).pop() ?? "";
}
