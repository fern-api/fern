import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema } from "@fern-api/yaml-schema";
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
}

export function constructFernFileContext({
    relativeFilepath,
    definitionFile,
    casingsGenerator,
}: {
    relativeFilepath: RelativeFilePath;
    definitionFile: DefinitionFileSchema;
    casingsGenerator: CasingsGenerator;
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
    };
    return file;
}
