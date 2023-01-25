import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { GeneratedSdkErrorSchema } from "@fern-typescript/contexts";
import { SdkErrorGenerator } from "@fern-typescript/sdk-error-generator";
import { GeneratedSdkErrorSchemaImpl } from "./GeneratedSdkErrorSchemaImpl";

export declare namespace SdkErrorSchemaGenerator {
    export interface Init {
        sdkErrorGenerator: SdkErrorGenerator;
    }

    export namespace generateError {
        export interface Args {
            errorName: string;
            errorDeclaration: ErrorDeclaration;
        }
    }
}

export class SdkErrorSchemaGenerator {
    private sdkErrorGenerator: SdkErrorGenerator;

    constructor({ sdkErrorGenerator }: SdkErrorSchemaGenerator.Init) {
        this.sdkErrorGenerator = sdkErrorGenerator;
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
            sdkErrorGenerator: this.sdkErrorGenerator,
        });
    }
}
