import { Argument } from "./Argument";
import { Import } from "./Import";
import { Variable, VariableType } from "./Variable";
import { ClassReference, NilValue, OmittedValue } from "./classes/ClassReference";
import { AstNode } from "./core/AstNode";

export declare namespace Parameter {
    export interface Init extends AstNode.Init {
        name: string;
        type: ClassReference | ClassReference[];
        wireValue?: string;
        defaultValue?: AstNode | string;
        isOptional?: boolean;
        shouldOmitOptional?: boolean;
        isNamed?: boolean;
        describeAsHashInYardoc?: boolean;
        isBlock?: boolean;
        example?: string | AstNode;
    }
}

export class Parameter extends AstNode {
    public name: string;
    public wireValue: string | undefined;
    public type: ClassReference[];
    // TODO: deal with constants in a more structured way.
    public defaultValue: AstNode | string | undefined;
    public isNamed: boolean;
    public isBlock: boolean;
    public describeAsHashInYardoc: boolean;
    public example: string | AstNode | undefined;

    constructor({
        name,
        type,
        defaultValue,
        wireValue,
        example,
        isOptional = false,
        shouldOmitOptional = false,
        isNamed = true,
        describeAsHashInYardoc = false,
        isBlock = false,
        ...rest
    }: Parameter.Init) {
        super(rest);
        this.name = name;
        this.type = type instanceof ClassReference ? [type] : type;
        this.defaultValue = isBlock
            ? undefined
            : (defaultValue ?? (isOptional ? (shouldOmitOptional ? OmittedValue : NilValue) : undefined));
        this.isNamed = isNamed || isBlock || this.defaultValue !== undefined;
        this.describeAsHashInYardoc = describeAsHashInYardoc;

        this.wireValue = wireValue;

        this.isBlock = isBlock;
        this.example = example;
    }

    public writeInternal(): void {
        const defaultString = this.defaultValue instanceof AstNode ? this.defaultValue.write({}) : this.defaultValue;
        this.addText({
            stringContent: this.name,
            templateString: this.isBlock ? "&%s" : this.isNamed ? "%s:" : undefined
        });
        this.addText({ stringContent: defaultString, templateString: " %s", appendToLastString: true });
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>();
        this.type.forEach((cr) => (imports = new Set([...imports, ...cr.getImports()])));
        return imports;
    }

    public toArgument(value: AstNode | string): Argument {
        return new Argument({
            name: this.name,
            value,
            isNamed: this.isNamed,
            documentation: this.documentation
        });
    }

    public toVariable(): Variable {
        return new Variable({
            name: this.name,
            type: this.type,
            documentation: this.documentation,
            variableType: VariableType.LOCAL
        });
    }
}
