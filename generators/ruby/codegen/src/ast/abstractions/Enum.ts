import { EnumTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { Class_ } from "../classes/Class_";
import { Expression } from "../expressions/Expression";

declare namespace Enum {
    export interface Init extends Class_.Init {
        enumTypeDeclaration: EnumTypeDeclaration;
    }
}

export class Enum extends Class_ {
    constructor({ enumTypeDeclaration, classReference, documentation }: Enum.Init) {
        super({
            expressions: enumTypeDeclaration.values.map(
                (enumValue) =>
                    new Expression({
                        leftSide: enumValue.name.name.screamingSnakeCase.safeName,
                        rightSide: `"${enumValue.name.wireValue}"`,
                        documentation: enumValue.docs,
                        isAssignment: true
                    })
            ),
            classReference,
            includeInitializer: false,
            documentation
        });
    }
}
