import { AvailabilityStatus } from "@fern-fern/ir-model/declaration";
import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { TypeDeclaration } from "@fern-fern/ir-model/types";
import { ErrorContext, GeneratedError, GeneratedType } from "@fern-typescript/sdk-declaration-handler";
import { TypeGenerator } from "@fern-typescript/type-generator";

export declare namespace GeneratedErrorImpl {
    export interface Init {
        errorName: string;
        errorDeclaration: ErrorDeclaration;
        typeGenerator: TypeGenerator;
    }
}

export class GeneratedErrorImpl implements GeneratedError {
    private typeDeclaration: TypeDeclaration;
    private generatedType: GeneratedType;

    constructor({ errorName, errorDeclaration, typeGenerator }: GeneratedErrorImpl.Init) {
        this.typeDeclaration = {
            availability: {
                status: AvailabilityStatus.GeneralAvailability,
                message: undefined,
            },
            name: errorDeclaration.name,
            docs: errorDeclaration.docs,
            shape: errorDeclaration.type,
            // TODO should we add these to errors?
            referencedTypes: [],
        };

        this.generatedType = typeGenerator.generateType({
            typeName: errorName,
            typeDeclaration: this.typeDeclaration,
        });
    }

    public writeToFile(context: ErrorContext): void {
        this.generatedType.writeToFile(context);
    }

    public getEquivalentTypeDeclaration(): TypeDeclaration {
        return this.typeDeclaration;
    }

    public getAsGeneratedType(): GeneratedType {
        return this.generatedType;
    }
}
