import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { Zurg, getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

import { TypeReference } from "@fern-fern/ir-sdk/api";

import { AbstractGeneratedEndpointTypeSchema } from "./AbstractGeneratedEndpointTypeSchema";

export declare namespace GeneratedEndpointTypeSchemaImpl {
    export interface Init extends AbstractGeneratedEndpointTypeSchema.Init {
        type: TypeReference;
    }
}

export class GeneratedEndpointTypeSchemaImpl extends AbstractGeneratedEndpointTypeSchema {
    private type: TypeReference;

    constructor({ type, ...superInit }: GeneratedEndpointTypeSchemaImpl.Init) {
        super(superInit);
        this.type = type;
    }

    protected generateRawTypeDeclaration(context: SdkContext, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            type: getTextOfTsNode(context.typeSchema.getReferenceToRawType(this.type).typeNode),
            isExported: true
        });
    }

    protected getReferenceToParsedShape(context: SdkContext): ts.TypeNode {
        return context.type.getReferenceToType(this.type).typeNode;
    }

    protected buildSchema(context: SdkContext): Zurg.Schema {
        return context.typeSchema.getSchemaOfTypeReference(this.type);
    }
}
