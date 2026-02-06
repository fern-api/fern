import { FernIr } from "@fern-fern/ir-sdk";
import { GeneratedExpressErrorSchema } from "@fern-typescript/contexts";

import { GeneratedExpressErrorSchemaImpl } from "./GeneratedExpressErrorSchemaImpl.js";

export declare namespace ExpressErrorSchemaGenerator {
    export interface Init {
        includeSerdeLayer: boolean;
        allowExtraFields: boolean;
    }

    export namespace generateError {
        export interface Args {
            errorName: string;
            errorDeclaration: FernIr.ErrorDeclaration;
        }
    }
}

export class ExpressErrorSchemaGenerator {
    private includeSerdeLayer: boolean;
    private allowExtraFields: boolean;

    constructor({ includeSerdeLayer, allowExtraFields }: ExpressErrorSchemaGenerator.Init) {
        this.includeSerdeLayer = includeSerdeLayer;
        this.allowExtraFields = allowExtraFields;
    }

    public generateExpressErrorSchema({
        errorDeclaration,
        errorName
    }: ExpressErrorSchemaGenerator.generateError.Args): GeneratedExpressErrorSchema | undefined {
        if (errorDeclaration.type == null) {
            return undefined;
        }
        return new GeneratedExpressErrorSchemaImpl({
            errorDeclaration,
            type: errorDeclaration.type,
            errorName,
            includeSerdeLayer: this.includeSerdeLayer,
            allowExtraFields: this.allowExtraFields
        });
    }
}
