import {
    FileLike,
    tryGetNameFromFileLike,
    getNameFromPath,
    tryGetContentLengthFromFileLike,
    tryGetFileSizeFromPath,
    isFileLike,
    tryGetContentTypeFromFileLike,
} from "./file.js";

export async function getFileWithMetadata(
    file: FileUpload,
): Promise<FileWithMetadata> {
    if (isFileLike(file)) {
        return getFileWithMetadata({
            data: file,
        });
    }
    if ("path" in file) {
        const fs = await import("fs");
        if(!fs || !fs.createReadStream) {
            throw new Error("File path uploads are not supported in this environment.");
        }
        const data = fs.createReadStream(file.path);
        const contentLength =
            file.contentLength ?? await tryGetFileSizeFromPath(file.path);
        const fileName = file.fileName ?? getNameFromPath(file.path);
        return {
            data,
            fileName,
            contentType: file.contentType,
            contentLength,
        };
    }
    if ("data" in file) {
        const data = file.data;
        const contentLength = file.contentLength ?? (await tryGetContentLengthFromFileLike(data));
        const fileName = file.fileName ?? tryGetNameFromFileLike(data);
        return {
            data,
            fileName,
            contentType: file.contentType ?? tryGetContentTypeFromFileLike(data),
            contentLength,
        };
    }

    throw new Error(`Invalid FileUpload of type ${typeof file}: ${JSON.stringify(file)}`);
}

export async function toBinaryUploadRequest(
    file: FileUpload,
): Promise<{ body: FileLike; headers?: Record<string, string> }> {
    const { data, fileName, contentLength, contentType } = await getFileWithMetadata(file);
    const request = {
        body: data,
        headers: {} as Record<string, string>,
    };
    if (fileName) {
        request.headers["Content-Disposition"] = `attachment; filename="${fileName}"`;
    }
    if (contentType) {
        request.headers["Content-Type"] = contentType;
    }
    if (contentLength != null) {
        request.headers["Content-Length"] = contentLength.toString();
    }
    return request;
}

export type FileUpload = FileLike | PathFileUploadOptions | DataFileUploadOptions;
export type PathFileUploadOptions = {
    path: string;
    fileName?: string;
    contentType?: string;
    contentLength?: number;
};
export type DataFileUploadOptions = {
    data: FileLike;
    fileName?: string;
    contentType?: string;
    contentLength?: number;
};
export type FileWithMetadata = {
    data: FileLike;
    fileName?: string;
    contentType?: string;
    contentLength?: number;
};
