import { readFile } from "node:fs/promises";
import path from "node:path";

import { entries } from "@fern-api/core-utils";
import { RelativeFilePath, getFilename } from "@fern-api/fs-utils";

export const AsIsFileNames = {
    // Core/Networking
    Http: "Core/Networking/HTTP.swift",
    HttpClient: "Core/Networking/HTTPClient.swift",
    QueryParameter: "Core/Networking/QueryParameter.swift",

    // Core/Serde
    DecoderPlusAdditionalProperties: "Core/Serde/Decoder+AdditionalProperties.swift",
    EncoderPlusAdditionalProperties: "Core/Serde/Encoder+AdditionalProperties.swift",
    Serde: "Core/Serde/Serde.swift",
    StringKey: "Core/Serde/StringKey.swift",

    // Core
    Prelude: "Core/Prelude.swift",
    StringPlusUrlEncoding: "Core/String+URLEncoding.swift",

    // Public
    APIErrorResponse: "Public/APIErrorResponse.swift",
    ClientConfig: "Public/ClientConfig.swift",
    ClientError: "Public/ClientError.swift",
    JsonValue: "Public/JSONValue.swift",
    RequestOptions: "Public/RequestOptions.swift"
};

export interface AsIsFileDefinition {
    filename: string;
    directory: RelativeFilePath;
    loadContents: () => Promise<string>;
}

export type AsIsFileId = keyof typeof AsIsFileNames;

export type AsIsFileDefinitionsById = {
    [K in AsIsFileId]: AsIsFileDefinition;
};

export const AsIsFiles = createAsIsFiles();

function createAsIsFiles(): AsIsFileDefinitionsById {
    const result = {} as AsIsFileDefinitionsById;

    for (const [key, relativePathToFile] of entries(AsIsFileNames)) {
        const filename = getFilename(RelativeFilePath.of(relativePathToFile));
        if (filename === undefined) {
            throw new Error(`Missing filename for as is file '${relativePathToFile}'`);
        }
        result[key] = {
            filename,
            directory: RelativeFilePath.of(path.dirname(relativePathToFile)),
            loadContents: () => {
                const absolutePath = path.join(__dirname, "asIs", filename);
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}
