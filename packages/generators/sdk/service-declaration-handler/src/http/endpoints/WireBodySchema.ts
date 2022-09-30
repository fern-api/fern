import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { TypeReference } from "@fern-fern/ir-model/types";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { AbstractSchemaGenerator } from "@fern-typescript/types-v2";
import { ts } from "ts-morph";

export declare namespace WireBodySchema {
    export interface Init {
        serviceName: DeclaredServiceName;
        endpoint: HttpEndpoint;
        typeName: string;
        type: TypeReference;
    }
}

export class WireBodySchema extends AbstractSchemaGenerator {
    private serviceName: DeclaredServiceName;
    private endpoint: HttpEndpoint;
    private type: TypeReference;

    constructor({ typeName, type, serviceName, endpoint }: WireBodySchema.Init) {
        super({ typeName });
        this.type = type;
        this.serviceName = serviceName;
        this.endpoint = endpoint;
    }

    public static of(init: WireBodySchema.Init): WireBodySchema | undefined {
        // for named schemas, we can just reference the schema of that named
        // type, no need to build our own
        if (init.type._type === "void" || init.type._type === "named") {
            return undefined;
        }
        return new WireBodySchema(init);
    }

    protected override getReferenceToParsedShape(file: SdkFile): ts.TypeNode {
        return file.getReferenceToType(this.type).typeNode;
    }

    protected override generateModule(): void {}

    protected override getSchema(file: SdkFile): Zurg.Schema {
        return file.getSchemaOfTypeReference(this.type);
    }

    public getReferenceToSchema(file: SdkFile): Zurg.Schema {
        return file.coreUtilities.zurg.Schema._fromExpression(
            ts.factory.createPropertyAccessExpression(
                file.getReferenceToEndpointSchemaFile(this.serviceName, this.endpoint.id).expression,
                this.typeName
            )
        );
    }

    public getReferenceToRawShape(file: SdkFile): ts.TypeNode {
        return file.getReferenceToRawType(this.type).typeNode;
    }
}
