import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { ObjectTypeDeclaration, Type } from "@fern-fern/ir-model/types";
import { SdkDeclarationHandler, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { generateObjectType } from "@fern-typescript/types-v2";

export declare namespace ErrorDeclarationHandler {
    export interface Args extends Omit<SdkDeclarationHandler.Args, "file"> {
        errorFile: SdkFile;
        schemaFile: SdkFile;
    }
}

export const ErrorDeclarationHandler: SdkDeclarationHandler<ErrorDeclaration, ErrorDeclarationHandler.Args> = {
    run: async (errorDeclaration, { errorFile, schemaFile, exportedName }) => {
        const shape = getErrorShapeWithoutAdditionalProperties(errorDeclaration, errorFile);
        generateObjectType({
            typeName: exportedName,
            typeDeclaration: {
                name: errorDeclaration.name,
                docs: errorDeclaration.docs,
                shape: Type.object(shape),
                // TODO errors should have referencedTypes
                referencedTypes: [],
            },
            typeFile: errorFile,
            schemaFile,
            shape,
            additionalProperties: [
                {
                    docs: undefined,
                    key: {
                        raw: errorFile.fernConstants.errorDiscriminant,
                        parsed: errorFile.fernConstants.errorDiscriminant,
                    },
                    value: {
                        type: "literal",
                        literal: errorDeclaration.discriminantValue.wireValue,
                        isOptional: false,
                    },
                },
            ],
        });
    },
};

function getErrorShapeWithoutAdditionalProperties(
    errorDeclaration: ErrorDeclaration,
    file: SdkFile
): ObjectTypeDeclaration {
    if (errorDeclaration.type._type === "alias") {
        const resolvedType = file.resolveTypeReference(errorDeclaration.type.aliasOf);
        if (resolvedType._type === "void") {
            return { extends: [], properties: [] };
        }
    }

    if (errorDeclaration.type._type === "object") {
        return errorDeclaration.type;
    }

    throw new Error("Error declaration type must be an object");
}
