import { ErrorDeclaration } from "@fern-fern/ir-model";
import { DeclarationHandler } from "@fern-typescript/declaration-handler";
import { generateObjectType } from "@fern-typescript/types-v2";
import { ts } from "ts-morph";

export const ErrorDeclarationHandler: DeclarationHandler<ErrorDeclaration> = {
    run: async (errorDeclaration, { withFile }) => {
        if (errorDeclaration.type._type !== "object") {
            throw new Error("Error declaration must be an object");
        }
        const shape = errorDeclaration.type;

        await withFile((file) => {
            generateObjectType({
                typeName: file.sourceFile.getBaseNameWithoutExtension(),
                docs: errorDeclaration.docs,
                file,
                shape,
                additionalProperties: {
                    [file.fernConstants.errorDiscriminant]: ts.factory.createLiteralTypeNode(
                        ts.factory.createStringLiteral(errorDeclaration.discriminantValue)
                    ),
                },
            });
        });
    },
};
