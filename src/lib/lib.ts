export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  // bytes が SharedArrayBuffer を参照してても、ArrayBuffer にコピーして返す
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
