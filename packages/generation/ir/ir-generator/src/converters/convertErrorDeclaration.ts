import { RawSchemas } from "@fern-api/yaml-schema";
import { ErrorDeclaration, FernFilepath, Type } from "@fern-fern/ir-model";
import { createTypeReferenceParser } from "../utils/parseInlineType";
import { convertExtends, convertObjectProperties } from "./type-declarations/convertTypeDeclaration";

export function convertErrorDeclaration({
    errorName,
    fernFilepath,
    errorDeclaration,
    imports,
}: {
    errorName: string;
    fernFilepath: FernFilepath;
    errorDeclaration: RawSchemas.ErrorDeclarationSchema;
    imports: Record<string, string>;
}): ErrorDeclaration {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });

    return {
        name: {
            name: errorName,
            fernFilepath,
        },
        docs: errorDeclaration.docs,
        statusCode: errorDeclaration.statusCode,
        type: Type.object({
            extends: convertExtends({ _extends: errorDeclaration.extends, fernFilepath, imports }),
            properties: convertObjectProperties({ objectProperties: errorDeclaration.properties, parseTypeReference }),
        }),
    };
}
