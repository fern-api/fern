import { readFile } from "node:fs/promises";
import path from "node:path";

import { entries } from "@fern-api/core-utils";
import { RelativeFilePath, getFilename } from "@fern-api/fs-utils";

export const AsIsFileNames = {
    // Core infrastructure templates
    ClientConfig: "client_config.rs",
    ApiClientBuilder: "api_client_builder.rs",
    HttpClient: "http_client.rs",
    RequestOptions: "request_options.rs",
    ClientError: "client_error.rs"
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

    for (const [key, filename] of entries(AsIsFileNames)) {
        result[key as AsIsFileId] = {
            filename,
            directory: RelativeFilePath.of("src"), // All in src/ directory
            loadContents: () => {
                const absolutePath = path.join(__dirname, "asIs", filename);
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}
