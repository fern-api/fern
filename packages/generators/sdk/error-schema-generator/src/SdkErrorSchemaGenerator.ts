import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { GeneratedSdkErrorSchema } from "@fern-typescript/contexts";
import { SdkErrorGenerator } from "@fern-typescript/sdk-error-generator";
import { GeneratedSdkErrorSchemaImpl } from "./GeneratedSdkErrorSchemaImpl";

export declare namespace SdkErrorSchemaGenerator {
    export interface Init {
        SdkErrorGenerator: SdkErrorGenerator;
    }

    export namespace generateError {
        export interface Args {
            errorName: string;
            errorDeclaration: ErrorDeclaration;
        }
    }
}

export class SdkErrorSchemaGenerator {
    private SdkErrorGenerator: SdkErrorGenerator;

    constructor({ SdkErrorGenerator }: SdkErrorSchemaGenerator.Init) {
        this.SdkErrorGenerator = SdkErrorGenerator;
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
            SdkErrorGenerator: this.SdkErrorGenerator,
        });
    }
}
