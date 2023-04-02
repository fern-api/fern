import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema, RootApiFileSchema } from "@fern-api/yaml-schema";
import { FernFilepath } from "@fern-fern/ir-model/commons";
import { TypeReference } from "@fern-fern/ir-model/types";
import { mapValues } from "lodash-es";
import { CasingsGenerator } from "./casings/CasingsGenerator";
import { convertToFernFilepath } from "./utils/convertToFernFilepath";
import { parseInlineType } from "./utils/parseInlineType";

/**
 * here is a description
 */
export interface FernFileContext {
    relativeFilepath: RelativeFilePath;
    fernFilepath: FernFilepath;
    imports: Record<string, RelativeFilePath>;
    definitionFile: DefinitionFileSchema;
    parseTypeReference: (type: string | { type: string }) => TypeReference;
    casingsGenerator: CasingsGenerator;
    rootApiFile: RootApiFileSchema;
}

export function constructRootApiFileContext({
    casingsGenerator,
    rootApiFile,
}: {
    casingsGenerator: CasingsGenerator;
    rootApiFile: RootApiFileSchema;
}): FernFileContext {
    return constructFernFileContext({
        relativeFilepath: RelativeFilePath.of("."),
        definitionFile: {
            imports: rootApiFile.imports,
        },
        casingsGenerator,
        rootApiFile,
    });
}

export function constructFernFileContext({
    relativeFilepath,
    definitionFile,
    casingsGenerator,
    rootApiFile,
}: {
    relativeFilepath: RelativeFilePath;
    definitionFile: DefinitionFileSchema;
    casingsGenerator: CasingsGenerator;
    rootApiFile: RootApiFileSchema;
}): FernFileContext {
    const file: FernFileContext = {
        relativeFilepath,
        fernFilepath: convertToFernFilepath({ relativeFilepath, casingsGenerator }),
        imports: mapValues(definitionFile.imports ?? {}, RelativeFilePath.of),
        definitionFile,
        parseTypeReference: (type) => {
            const typeAsString = typeof type === "string" ? type : type.type;
            return parseInlineType({ type: typeAsString, file });
        },
        casingsGenerator,
        rootApiFile,
    };
    return file;
}
