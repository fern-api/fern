var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { toMultipartDataPart } from "../../core/file/index.mjs";
import { toJson } from "../../core/json.mjs";
import { RUNTIME } from "../runtime/index.mjs";
export function newFormData() {
    return __awaiter(this, void 0, void 0, function* () {
        return new FormDataWrapper();
    });
}
export class FormDataWrapper {
    constructor() {
        this.fd = new FormData();
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            // noop
        });
    }
    append(key, value) {
        this.fd.append(key, String(value));
    }
    appendFile(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, filename, contentType } = yield toMultipartDataPart(value);
            const blob = yield convertToBlob(data, contentType);
            if (filename) {
                this.fd.append(key, blob, filename);
            }
            else {
                this.fd.append(key, blob);
            }
        });
    }
    getRequest() {
        return {
            body: this.fd,
            headers: {},
            duplex: "half",
        };
    }
}
function isStreamLike(value) {
    return typeof value === "object" && value != null && ("read" in value || "pipe" in value);
}
function isReadableStream(value) {
    return typeof value === "object" && value != null && "getReader" in value;
}
function isBuffer(value) {
    return typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(value);
}
function isArrayBufferView(value) {
    return ArrayBuffer.isView(value);
}
function streamToBuffer(stream) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, stream_1, stream_1_1;
        var _b, e_1, _c, _d;
        if (RUNTIME.type === "node") {
            const { Readable } = yield import("stream");
            if (stream instanceof Readable) {
                const chunks = [];
                try {
                    for (_a = true, stream_1 = __asyncValues(stream); stream_1_1 = yield stream_1.next(), _b = stream_1_1.done, !_b; _a = true) {
                        _d = stream_1_1.value;
                        _a = false;
                        const chunk = _d;
                        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_a && !_b && (_c = stream_1.return)) yield _c.call(stream_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return Buffer.concat(chunks);
            }
        }
        if (isReadableStream(stream)) {
            const reader = stream.getReader();
            const chunks = [];
            try {
                while (true) {
                    const { done, value } = yield reader.read();
                    if (done)
                        break;
                    chunks.push(value);
                }
            }
            finally {
                reader.releaseLock();
            }
            const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
            const result = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) {
                result.set(chunk, offset);
                offset += chunk.length;
            }
            return Buffer.from(result);
        }
        throw new Error(`Unsupported stream type: ${typeof stream}. Expected Node.js Readable stream or Web ReadableStream.`);
    });
}
function convertToBlob(value, contentType) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isStreamLike(value) || isReadableStream(value)) {
            const buffer = yield streamToBuffer(value);
            return new Blob([buffer], { type: contentType });
        }
        if (value instanceof Blob) {
            return value;
        }
        if (isBuffer(value)) {
            return new Blob([value], { type: contentType });
        }
        if (value instanceof ArrayBuffer) {
            return new Blob([value], { type: contentType });
        }
        if (isArrayBufferView(value)) {
            return new Blob([value], { type: contentType });
        }
        if (typeof value === "string") {
            return new Blob([value], { type: contentType });
        }
        if (typeof value === "object" && value !== null) {
            return new Blob([toJson(value)], { type: contentType !== null && contentType !== void 0 ? contentType : "application/json" });
        }
        return new Blob([String(value)], { type: contentType });
    });
}
