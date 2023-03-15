import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { GeneratedExpressErrorSchema } from "@fern-typescript/contexts";
import { GeneratedExpressErrorSchemaImpl } from "./GeneratedExpressErrorSchemaImpl";

export declare namespace ExpressErrorSchemaGenerator {
    export namespace generateError {
        export interface Args {
            errorName: string;
            errorDeclaration: ErrorDeclaration;
        }
    }
}

export class ExpressErrorSchemaGenerator {
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
        });
    }
}
