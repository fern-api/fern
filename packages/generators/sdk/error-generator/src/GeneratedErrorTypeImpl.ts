import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { TypeReference } from "@fern-fern/ir-model/types";
import { ErrorContext, GeneratedAliasType, GeneratedErrorType, GeneratedType } from "@fern-typescript/contexts";
import { TypeGenerator } from "@fern-typescript/type-generator";

export declare namespace GeneratedErrorTypeImpl {
    export interface Init {
        errorName: string;
        errorDeclaration: ErrorDeclaration;
        type: TypeReference;
        typeGenerator: TypeGenerator<ErrorContext>;
    }
}

export class GeneratedErrorTypeImpl implements GeneratedErrorType {
    public readonly type = "type";

    private generatedType: GeneratedAliasType<ErrorContext>;

    constructor({ errorName, errorDeclaration, type, typeGenerator }: GeneratedErrorTypeImpl.Init) {
        this.generatedType = typeGenerator.generateAlias({
            typeName: errorName,
            aliasOf: type,
            examples: [],
            docs: errorDeclaration.docs ?? undefined,
            fernFilepath: errorDeclaration.name.fernFilepath,
            getReferenceToSelf: (context) => context.error.getReferenceToError(errorDeclaration.name),
        });
    }

    public writeToFile(context: ErrorContext): void {
        this.generatedType.writeToFile(context);
    }

    public generateErrorBody(): GeneratedType<ErrorContext> {
        return this.generatedType;
    }
}
