import { ErrorDeclaration } from "@fern-fern/ir-sdk/api";
import { GeneratedExpressErrorSchema } from "@fern-typescript/contexts";
import { GeneratedExpressErrorSchemaImpl } from "./GeneratedExpressErrorSchemaImpl";

export declare namespace ExpressErrorSchemaGenerator {
    export interface Init {
        includeSerdeLayer: boolean;
    }

    export namespace generateError {
        export interface Args {
            errorName: string;
            errorDeclaration: ErrorDeclaration;
        }
    }
}

export class ExpressErrorSchemaGenerator {
    private includeSerdeLayer: boolean;

    constructor({ includeSerdeLayer }: ExpressErrorSchemaGenerator.Init) {
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public generateExpressErrorSchema({
        errorDeclaration,
        errorName,
    }: ExpressErrorSchemaGenerator.generateError.Args): GeneratedExpressErrorSchema | undefined {
        if (errorDeclaration.type == null) {
            return undefined;
        }
        return new GeneratedExpressErrorSchemaImpl({
            errorDeclaration,
            type: errorDeclaration.type,
            errorName,
            includeSerdeLayer: this.includeSerdeLayer,
        });
    }
}
