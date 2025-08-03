import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { entries } from "@fern-api/core-utils";
import { getFilename, RelativeFilePath } from "@fern-api/fs-utils";

/**
 * Configuration for a static Swift file that gets included as-is in the generated SDK.
 * This serves as the source definition that gets transformed into AsIsFileDefinition.
 */
interface AsIsFileSpec {
    /**
     * Relative path where the file should be placed in the generated project.
     */
    relativePath: string;

    /**
     * The names of the non-private nodes (classes, structs, enums, etc.) that this file introduces to
     * the project namespace. Used for name collision handling.
     */
    nodeNames?: string[];
}

const AsIsFileSpecs = {
    // Core/Networking
    Http: {
        relativePath: "Core/Networking/HTTP.swift",
        nodeNames: ["HTTP"]
    },
    HttpClient: {
        relativePath: "Core/Networking/HTTPClient.swift",
        nodeNames: ["HTTPClient"]
    },
    QueryParameter: {
        relativePath: "Core/Networking/QueryParameter.swift",
        nodeNames: ["QueryParameter"]
    },

    // Core/Serde
    DecoderPlusAdditionalProperties: {
        relativePath: "Core/Serde/Decoder+AdditionalProperties.swift"
    },
    EncoderPlusAdditionalProperties: {
        relativePath: "Core/Serde/Encoder+AdditionalProperties.swift"
    },
    Serde: {
        relativePath: "Core/Serde/Serde.swift",
        nodeNames: ["Serde"]
    },
    StringKey: {
        relativePath: "Core/Serde/StringKey.swift",
        nodeNames: ["StringKey"]
    },

    // Core
    Prelude: {
        relativePath: "Core/Prelude.swift"
    },
    StringPlusUrlEncoding: {
        relativePath: "Core/String+URLEncoding.swift"
    },

    // Public
    APIErrorResponse: {
        relativePath: "Public/APIErrorResponse.swift",
        nodeNames: ["APIErrorResponse"]
    },
    ClientConfig: {
        relativePath: "Public/ClientConfig.swift",
        nodeNames: ["ClientConfig"]
    },
    ClientError: {
        relativePath: "Public/ClientError.swift",
        nodeNames: ["ClientError"]
    },
    JsonValue: {
        relativePath: "Public/JSONValue.swift",
        nodeNames: ["JSONValue"]
    },
    RequestOptions: {
        relativePath: "Public/RequestOptions.swift",
        nodeNames: ["RequestOptions"]
    }
} satisfies Record<string, AsIsFileSpec>;

export interface AsIsFileDefinition {
    filename: string;
    directory: RelativeFilePath;
    nodeNames: string[];
    loadContents: () => Promise<string>;
}

export type AsIsFileId = keyof typeof AsIsFileSpecs;

export type AsIsFileDefinitionsById = {
    [K in AsIsFileId]: AsIsFileDefinition;
};

export const AsIsFiles = createAsIsFiles();

function createAsIsFiles(): AsIsFileDefinitionsById {
    const result = {} as AsIsFileDefinitionsById;

    for (const [key, spec] of entries(AsIsFileSpecs)) {
        const { relativePath, nodeNames } = spec as AsIsFileSpec;
        const filename = getFilename(RelativeFilePath.of(relativePath));
        if (filename === undefined) {
            throw new Error(`Missing filename for as is file '${relativePath}'`);
        }
        result[key] = {
            filename,
            directory: RelativeFilePath.of(dirname(spec.relativePath)),
            nodeNames: nodeNames ?? [],
            loadContents: () => {
                const absolutePath = join(__dirname, "asIs", filename);
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}
