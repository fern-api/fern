import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { ErrorContext, GeneratedError, GeneratedType } from "@fern-typescript/sdk-declaration-handler";
import { TypeGenerator } from "@fern-typescript/type-generator";

export declare namespace GeneratedErrorImpl {
    export interface Init {
        errorName: string;
        errorDeclaration: ErrorDeclaration;
        typeGenerator: TypeGenerator<ErrorContext>;
    }
}

export class GeneratedErrorImpl implements GeneratedError {
    private generatedType: GeneratedType<ErrorContext>;

    constructor({ errorName, errorDeclaration, typeGenerator }: GeneratedErrorImpl.Init) {
        this.generatedType = typeGenerator.generateType({
            typeName: errorName,
            shape: errorDeclaration.type,
            docs: errorDeclaration.docs ?? undefined,
            fernFilepath: errorDeclaration.name.fernFilepathV2,
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
