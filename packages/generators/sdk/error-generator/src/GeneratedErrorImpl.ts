import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { ResolvedTypeReference, Type, TypeReference } from "@fern-fern/ir-model/types";
import { ErrorContext, GeneratedError, GeneratedType } from "@fern-typescript/contexts";
import { TypeGenerator } from "@fern-typescript/type-generator";

export declare namespace GeneratedErrorImpl {
    export interface Init {
        errorName: string;
        errorDeclaration: ErrorDeclaration;
        type: TypeReference;
        typeGenerator: TypeGenerator<ErrorContext>;
    }
}

export class GeneratedErrorImpl implements GeneratedError {
    private generatedType: GeneratedType<ErrorContext>;

    constructor({ errorName, errorDeclaration, type, typeGenerator }: GeneratedErrorImpl.Init) {
        this.generatedType = typeGenerator.generateType({
            typeName: errorName,
            shape: Type.alias({
                aliasOf: type,
                // TODO do we need to figure out the resolved type?
                resolvedType: ResolvedTypeReference.unknown(),
            }),
            examples: [],
            docs: errorDeclaration.docs ?? undefined,
            fernFilepath: errorDeclaration.name.fernFilepath,
            getReferenceToSelf: (context) => context.error.getReferenceToError(errorDeclaration.name),
        });
    }

    public writeToFile(context: ErrorContext): void {
        this.generatedType.writeToFile(context);
    }

    public getAsGeneratedType(): GeneratedType<ErrorContext> {
        return this.generatedType;
    }
}
