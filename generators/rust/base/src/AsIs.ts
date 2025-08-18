import { readFile } from "node:fs/promises";
import path from "node:path";

import { entries } from "@fern-api/core-utils";
import { getFilename, RelativeFilePath } from "@fern-api/fs-utils";

export const AsIsFileNames = {
    // Core infrastructure templates
    ApiClientBuilder: "api_client_builder.rs",
    HttpClient: "http_client.rs",
    RequestOptions: "request_options.rs",
    ClientError: "client_error.rs",
    Pagination: "pagination.rs",
    BytesUtils: "bytes_utils.rs",
    // Project-level configuration files
    CargoToml: "Cargo.toml",
    Gitignore: ".gitignore",
    RustfmtToml: "rustfmt.toml"
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
        // Project-level files go in root, source files go in src/
        const isProjectFile = key === "CargoToml" || key === "Gitignore" || key === "RustfmtToml";
        const directory = isProjectFile ? RelativeFilePath.of("") : RelativeFilePath.of("src");

        result[key as AsIsFileId] = {
            filename,
            directory,
            loadContents: () => {
                const absolutePath = path.join(__dirname, "asIs", filename);
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}
