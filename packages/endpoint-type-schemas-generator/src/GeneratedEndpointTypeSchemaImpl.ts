import { TypeReference } from "@fern-fern/ir-model/types";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { EndpointTypeSchemasContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";
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

    protected generateRawTypeDeclaration(context: EndpointTypeSchemasContext, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            type: getTextOfTsNode(context.typeSchema.getReferenceToRawType(this.type).typeNode),
        });
    }

    protected getReferenceToParsedShape(context: EndpointTypeSchemasContext): ts.TypeNode {
        return context.type.getReferenceToType(this.type).typeNode;
    }

    protected buildSchema(context: EndpointTypeSchemasContext): Zurg.Schema {
        return context.typeSchema.getSchemaOfTypeReference(this.type);
    }
}
