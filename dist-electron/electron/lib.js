"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guessMimeType = guessMimeType;
const path_1 = __importDefault(require("path"));
function guessMimeType(filePath) {
    const ext = path_1.default.extname(filePath).toLowerCase();
    if (ext === ".png")
        return "image/png";
    if (ext === ".webp")
        return "image/webp";
    if (ext === ".jpg" || ext === ".jpeg")
        return "image/jpeg";
    return "image/jpeg";
}
