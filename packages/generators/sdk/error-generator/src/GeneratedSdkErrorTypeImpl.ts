import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { TypeReference } from "@fern-fern/ir-model/types";
import { GeneratedAliasType, GeneratedSdkErrorType, GeneratedType, SdkErrorContext } from "@fern-typescript/contexts";
import { TypeGenerator } from "@fern-typescript/type-generator";

export declare namespace GeneratedSdkErrorTypeImpl {
    export interface Init {
        errorName: string;
        errorDeclaration: ErrorDeclaration;
        type: TypeReference;
        typeGenerator: TypeGenerator<SdkErrorContext>;
    }
}

export class GeneratedSdkErrorTypeImpl implements GeneratedSdkErrorType {
    public readonly type = "type";

    private generatedType: GeneratedAliasType<SdkErrorContext>;

    constructor({ errorName, errorDeclaration, type, typeGenerator }: GeneratedSdkErrorTypeImpl.Init) {
        this.generatedType = typeGenerator.generateAlias({
            typeName: errorName,
            aliasOf: type,
            examples: [],
            docs: errorDeclaration.docs ?? undefined,
            fernFilepath: errorDeclaration.name.fernFilepath,
            getReferenceToSelf: (context) => context.error.getReferenceToError(errorDeclaration.name),
        });
    }

    public writeToFile(context: SdkErrorContext): void {
        this.generatedType.writeToFile(context);
    }

    public generateErrorBody(): GeneratedType<SdkErrorContext> {
        return this.generatedType;
    }
}
