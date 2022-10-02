import { RelativeFilePath } from "@fern-api/core-utils";
import { ServiceFileSchema } from "@fern-api/yaml-schema";
import { FernFilepath } from "@fern-fern/ir-model/commons";
import { TypeReference } from "@fern-fern/ir-model/types";
import { mapValues } from "lodash-es";
import { convertToFernFilepath } from "./utils/convertToFernFilepath";
import { parseInlineType } from "./utils/parseInlineType";

export interface FernFileContext {
    relativeFilepath: RelativeFilePath;
    fernFilepath: FernFilepath;
    imports: Record<string, RelativeFilePath>;
    parseTypeReference: (type: string | { type: string }) => TypeReference;
}

export function constructFernFileContext({
    relativeFilepath,
    serviceFile,
}: {
    relativeFilepath: RelativeFilePath | undefined;
    serviceFile: ServiceFileSchema;
}): FernFileContext {
    const file: FernFileContext = {
        relativeFilepath: relativeFilepath != null ? RelativeFilePath.of(relativeFilepath) : ".",
        fernFilepath: relativeFilepath != null ? convertToFernFilepath(relativeFilepath) : [],
        imports: mapValues(serviceFile.imports ?? {}, RelativeFilePath.of),
        parseTypeReference: (type) => {
            const typeAsString = typeof type === "string" ? type : type.type;
            return parseInlineType({ type: typeAsString, file });
        },
    };
    return file;
}
