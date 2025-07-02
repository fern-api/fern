export type FileLike =
    | ArrayBuffer
    | Uint8Array
    | import("buffer").Buffer
    | import("buffer").Blob
    | import("buffer").File
    | import("stream").Readable
    | import("stream/web").ReadableStream
    | globalThis.Blob
    | globalThis.File
    | ReadableStream;
