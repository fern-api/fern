import { ClassReference, NilValue } from "./classes/ClassReference";
import { AstNode } from "./core/AstNode";
import { Import } from "./Import";
import { Variable } from "./Variable";

export declare namespace Parameter {
    export interface Init extends AstNode.Init {
        name: string;
        type: ClassReference;
        defaultValue?: Variable | string;
        isOptional?: boolean;
        isNamed?: boolean;
    }
}

export class Parameter extends AstNode {
    public name: string;
    public type: ClassReference;
    // TODO: deal with constants in a more structured way.
    public defaultValue: Variable | string | undefined;
    public isNamed: boolean;

    constructor({ name, type, defaultValue, isOptional = false, isNamed = true, ...rest }: Parameter.Init) {
        super(rest);
        this.name = name;
        this.type = type;
        this.defaultValue = defaultValue ?? (isOptional ? NilValue : undefined);
        this.isNamed = isNamed || this.defaultValue !== undefined;
    }

    public writeInternal(): void {
        const defaultString = this.defaultValue instanceof Variable ? this.defaultValue.write() : this.defaultValue;
        this.addText({ stringContent: this.name, templateString: this.isNamed ? "%s:" : undefined });
        this.addText({ stringContent: defaultString, templateString: " %s", appendToLastString: true });
    }

    public getImports(): Set<Import> {
        return this.type.getImports();
    }
}
