import { ErrorDeclaration } from "@fern-fern/ir-model";
import { ts } from "@ts-morph/common";
import { DeclarationHandlerArgs } from "../client/types";
import { generateObjectType } from "../type-declaration-handler/generateObjectType";

export interface ErrorDeclarationHandler {
    run: (errorDeclaration: ErrorDeclaration, args: DeclarationHandlerArgs) => Promise<void>;
}

export const ErrorDeclarationHandler: ErrorDeclarationHandler = {
    run: async (errorDeclaration, { withFile }) => {
        if (errorDeclaration.type._type !== "object") {
            throw new Error("Error declaration must be an object");
        }
        const shape = errorDeclaration.type;

        await withFile((file) => {
            generateObjectType({
                typeName: errorDeclaration.name.name,
                docs: errorDeclaration.docs,
                file,
                shape,
                additionalProperties: {
                    [file.fernConstants.errorDiscriminant]: ts.factory.createLiteralTypeNode(
                        ts.factory.createStringLiteral(errorDeclaration.name.name)
                    ),
                },
            });
        });
    },
};
