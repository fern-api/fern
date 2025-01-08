import { mapValues } from "lodash-es";

import { DefinitionFileSchema, RawSchemas, RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { FernFilepath, TypeReference } from "@fern-api/ir-sdk";
import { RelativeFilePath } from "@fern-api/path-utils";

import { CasingsGenerator } from "./casings/CasingsGenerator";
import { convertToFernFilepath } from "./utils/convertToFernFilepath";
import { parseInlineType } from "./utils/parseInlineType";

/**
 * here is a description
 */
export interface FernFileContext {
    defaultUrl: string | undefined;
    relativeFilepath: RelativeFilePath;
    fernFilepath: FernFilepath;
    imports: Record<string, RelativeFilePath>;
    definitionFile: DefinitionFileSchema;
    parseTypeReference: (
        type: string | { type: string; inline?: boolean; default?: unknown; validation?: RawSchemas.ValidationSchema }
    ) => TypeReference;
    casingsGenerator: CasingsGenerator;
    rootApiFile: RootApiFileSchema;
}

export function constructRootApiFileContext({
    casingsGenerator,
    rootApiFile
}: {
    casingsGenerator: CasingsGenerator;
    rootApiFile: RootApiFileSchema;
}): FernFileContext {
    return constructFernFileContext({
        relativeFilepath: RelativeFilePath.of("."),
        definitionFile: {
            imports: rootApiFile.imports
        },
        casingsGenerator,
        rootApiFile
    });
}

export function constructFernFileContext({
    defaultUrl,
    relativeFilepath,
    definitionFile,
    casingsGenerator,
    rootApiFile
}: {
    defaultUrl?: string;
    relativeFilepath: RelativeFilePath;
    definitionFile: DefinitionFileSchema;
    casingsGenerator: CasingsGenerator;
    rootApiFile: RootApiFileSchema;
}): FernFileContext {
    const file: FernFileContext = {
        defaultUrl,
        relativeFilepath,
        fernFilepath: convertToFernFilepath({ relativeFilepath, casingsGenerator }),
        imports: mapValues(definitionFile.imports ?? {}, RelativeFilePath.of),
        definitionFile,
        parseTypeReference: (type) => {
            if (typeof type === "string") {
                return parseInlineType({ type, _default: undefined, validation: undefined, file });
            }
            return parseInlineType({
                type: type.type,
                _default: type.default,
                validation: type.validation,
                file
            });
        },
        casingsGenerator,
        rootApiFile
    };
    return file;
}
