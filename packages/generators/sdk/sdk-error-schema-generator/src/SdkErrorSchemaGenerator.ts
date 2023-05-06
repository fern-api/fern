import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { GeneratedSdkErrorSchema } from "@fern-typescript/contexts";
import { GeneratedSdkErrorSchemaImpl } from "./GeneratedSdkErrorSchemaImpl";

export declare namespace SdkErrorSchemaGenerator {
    export interface Init {
        skipValidation: boolean;
    }

    export namespace generateError {
        export interface Args {
            errorName: string;
            errorDeclaration: ErrorDeclaration;
        }
    }
}

export class SdkErrorSchemaGenerator {
    private skipValidation: boolean;

    constructor({ skipValidation }: SdkErrorSchemaGenerator.Init) {
        this.skipValidation = skipValidation;
    }

    public generateSdkErrorSchema({
        errorDeclaration,
        errorName,
    }: SdkErrorSchemaGenerator.generateError.Args): GeneratedSdkErrorSchema | undefined {
        if (errorDeclaration.type == null) {
            return undefined;
        }
        return new GeneratedSdkErrorSchemaImpl({
            errorDeclaration,
            type: errorDeclaration.type,
            errorName,
            skipValidation: this.skipValidation,
        });
    }
}
