import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-model/types";
import { ParsedEnumValue } from "./ParsedEnumValue";

export declare namespace AbstractEnumFileDeclaration {
    export interface Init {
        enum_: EnumTypeDeclaration;
        typeDeclaration: TypeDeclaration;
        typeName: string;
        parsedEnumValues: ParsedEnumValue[];
    }
}

export abstract class AbstractEnumFileDeclaration {
    protected enum_: EnumTypeDeclaration;
    protected typeDeclaration: TypeDeclaration;
    protected typeName: string;
    protected parsedEnumValues: ParsedEnumValue[];

    constructor(init: AbstractEnumFileDeclaration.Init) {
        this.enum_ = init.enum_;
        this.typeDeclaration = init.typeDeclaration;
        this.typeName = init.typeName;
        this.parsedEnumValues = init.parsedEnumValues;
    }
}
