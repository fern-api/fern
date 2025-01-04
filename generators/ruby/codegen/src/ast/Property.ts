import { Name } from "@fern-fern/ir-sdk/api";

import { Argument } from "./Argument";
import { Import } from "./Import";
import { Parameter } from "./Parameter";
import { Variable, VariableType } from "./Variable";
import { ClassReference } from "./classes/ClassReference";
import { AstNode } from "./core/AstNode";

export declare namespace Property {
    export interface Init extends AstNode.Init {
        name: string;
        type: ClassReference | ClassReference[];
        wireValue?: string;
        isOptional?: boolean;
        example?: string | AstNode | undefined;
    }
}
export class Property extends AstNode {
    public name: string;
    public type: ClassReference[];
    public wireValue: string | undefined;
    public isOptional: boolean;

    // Really just a convenience property to pass through to the Parameter
    public example: string | AstNode | undefined;

    constructor({ name, type, wireValue, example, isOptional = false, ...rest }: Property.Init) {
        super(rest);
        this.name = name;
        this.type = type instanceof ClassReference ? [type] : type;
        this.wireValue = wireValue;
        this.isOptional = isOptional;

        this.example = example;
    }

    public toArgument(value: Variable | string, isNamed: boolean): Argument {
        return new Argument({
            name: this.name,
            value,
            isNamed
        });
    }

    public toParameter({
        defaultValue,
        describeAsHashInYardoc,
        shouldOmitOptional
    }: {
        defaultValue?: Variable | string;
        describeAsHashInYardoc?: boolean;
        shouldOmitOptional?: boolean;
    }): Parameter {
        return new Parameter({
            name: this.name,
            type: this.type,
            isOptional: this.isOptional,
            documentation: this.documentation,
            defaultValue,
            describeAsHashInYardoc,
            shouldOmitOptional,
            example: this.example
        });
    }

    public toVariable(variableType?: VariableType): Variable {
        return new Variable({
            name: this.name,
            type: this.type,
            variableType: variableType ?? VariableType.INSTANCE,
            isOptional: this.isOptional
        });
    }

    public writeInternal(): void {
        this.addText({ stringContent: this.name, templateString: ":%s" });
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>();
        this.type.forEach((cr) => (imports = new Set([...imports, ...cr.getImports()])));
        return imports;
    }

    public static getNameFromIr(name: Name): string {
        return name.snakeCase.safeName;
    }
}
