import { FernIr } from "@fern-fern/ir-sdk";
import { GeneratedSdkErrorSchema } from "@fern-typescript/contexts";

import { GeneratedSdkErrorSchemaImpl } from "./GeneratedSdkErrorSchemaImpl.js";

export declare namespace SdkErrorSchemaGenerator {
    export interface Init {
        skipValidation: boolean;
        includeSerdeLayer: boolean;
    }

    export namespace generateError {
        export interface Args {
            errorName: string;
            errorDeclaration: FernIr.ErrorDeclaration;
        }
    }
}

export class SdkErrorSchemaGenerator {
    private skipValidation: boolean;
    private includeSerdeLayer: boolean;

    constructor({ skipValidation, includeSerdeLayer }: SdkErrorSchemaGenerator.Init) {
        this.skipValidation = skipValidation;
        this.includeSerdeLayer = includeSerdeLayer;
    }

    public generateSdkErrorSchema({
        errorDeclaration,
        errorName
    }: SdkErrorSchemaGenerator.generateError.Args): GeneratedSdkErrorSchema | undefined {
        if (errorDeclaration.type == null) {
            return undefined;
        }
        return new GeneratedSdkErrorSchemaImpl({
            errorDeclaration,
            type: errorDeclaration.type,
            errorName,
            skipValidation: this.skipValidation,
            includeSerdeLayer: this.includeSerdeLayer
        });
    }
}
