import { ErrorDeclaration, ObjectTypeDeclaration } from "@fern-fern/ir-model";
import { DeclarationHandler, File } from "@fern-typescript/declaration-handler";
import { generateObjectType } from "@fern-typescript/types-v2";
import { ts } from "ts-morph";

export const ErrorDeclarationHandler: DeclarationHandler<ErrorDeclaration> = {
    run: async (errorDeclaration, { withFile }) => {
        await withFile((file) => {
            generateObjectType({
                typeName: file.sourceFile.getBaseNameWithoutExtension(),
                docs: errorDeclaration.docs,
                file,
                shape: getErrorShapeWithoutAdditionalProperties(errorDeclaration, file),
                additionalProperties: {
                    [file.fernConstants.errorDiscriminant]: ts.factory.createLiteralTypeNode(
                        ts.factory.createStringLiteral(errorDeclaration.discriminantValue.wireValue)
                    ),
                },
            });
        });
    },
};

function getErrorShapeWithoutAdditionalProperties(
    errorDeclaration: ErrorDeclaration,
    file: File
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
