import { EnumTypeDeclaration, EnumValue } from "@fern-fern/ir-sdk/api";
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
                        leftSide: generateEnumName(enumValue),
                        rightSide: `"${generateEnumValue(enumValue)}"`,
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

function generateEnumName(enumValue: EnumValue): string {
    return enumValue.name.name.screamingSnakeCase.safeName;
}

function generateEnumValue(enumValue: EnumValue): string {
    return enumValue.name.wireValue;
}

export function generateEnumNameFromValues(example: string, values: EnumValue[]): string | undefined {
    const enumValue = values.find((ev) => generateEnumValue(ev) === example);
    return enumValue != null ? generateEnumName(enumValue) : undefined;
}
