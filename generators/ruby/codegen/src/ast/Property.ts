import { Argument } from "./Argument";
import { ClassReference } from "./classes/ClassReference";
import { AstNode } from "./core/AstNode";
import { Import } from "./Import";
import { Parameter } from "./Parameter";
import { Variable, VariableType } from "./Variable";

export declare namespace Property {
    export interface Init extends AstNode.Init {
        name: string;
        type: ClassReference;
        wireValue?: string;
        isOptional?: boolean;
    }
}
export class Property extends AstNode {
    public name: string;
    public type: ClassReference;
    public wireValue: string | undefined;
    public isOptional: boolean;

    constructor({ name, type, wireValue, isOptional = false, ...rest }: Property.Init) {
        super(rest);
        this.name = name;
        this.type = type;
        this.wireValue = wireValue;
        this.isOptional = isOptional;
    }

    public toArgument(value: Variable | string, isNamed: boolean): Argument {
        return new Argument({
            name: this.name,
            type: this.type,
            value,
            isNamed
        });
    }

    public toParameter({
        defaultValue,
        describeAsHashInYardoc
    }: {
        defaultValue?: Variable | string;
        describeAsHashInYardoc?: boolean;
    }): Parameter {
        return new Parameter({
            name: this.name,
            type: this.type,
            isOptional: this.isOptional,
            documentation: this.documentation,
            defaultValue,
            describeAsHashInYardoc
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
        return this.type.getImports();
    }
}
