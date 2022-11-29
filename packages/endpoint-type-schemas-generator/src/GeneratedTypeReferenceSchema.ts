import { TypeReference } from "@fern-fern/ir-model/types";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { EndpointTypeSchemasContext } from "@fern-typescript/sdk-declaration-handler";
import { VariableDeclarationKind } from "ts-morph";

export declare namespace GeneratedTypeReferenceSchema {
    export interface Init {
        typeName: string;
        typeReference: TypeReference;
    }
}

export class GeneratedTypeReferenceSchema {
    private typeName: string;
    private typeReference: TypeReference;

    constructor({ typeName, typeReference }: GeneratedTypeReferenceSchema.Init) {
        this.typeName = typeName;
        this.typeReference = typeReference;
    }

    public static of({
        typeName,
        typeReference,
    }: {
        typeName: string;
        typeReference: TypeReference | undefined;
    }): GeneratedTypeReferenceSchema | undefined {
        if (
            typeReference == null ||
            // for named schemas, we can just reference the schema of that named
            // type, no need to build our own
            typeReference._type === "named"
        ) {
            return undefined;
        }

        return new GeneratedTypeReferenceSchema({ typeName, typeReference });
    }

    public writeToFile(context: EndpointTypeSchemasContext): void {
        context.sourceFile.addVariableStatement({
            isExported: true,
            declarationKind: VariableDeclarationKind.Const,
            declarations: [
                {
                    name: this.typeName,
                    type: getTextOfTsNode(
                        context.coreUtilities.zurg.Schema._getReferenceToType({
                            rawShape: context.getReferenceToRawType(this.typeReference).typeNode,
                            parsedShape: context.getReferenceToType(this.typeReference).typeNode,
                        })
                    ),
                    initializer: getTextOfTsNode(context.getSchemaOfTypeReference(this.typeReference).toExpression()),
                },
            ],
        });
    }
}
