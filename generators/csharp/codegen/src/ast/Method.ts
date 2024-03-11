import { Access } from "../core/Access";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { ClassReference } from "./ClassReference";
import { CodeBlock } from "./CodeBlock";
import { MethodInvocation } from "./MethodInvocation";
import { Parameter } from "./Parameter";
import { Type } from "./Type";

export enum MethodType {
    INSTANCE,
    STATIC
}

export declare namespace Method {
    interface Args {
        /* The name of the method */
        name: string;
        /* The access of the method */
        access: Access;
        /* The parameters of the method */
        parameters: Parameter[];
        /* The return type of the method */
        return: Type;
        /* The body of the method */
        body: string | ((writer: Writer) => void);
        /* Docs for the method */
        docs: string | undefined;
        /* The type of the method */
        type?: MethodType;
        /* The class this method belongs to, if any */
        classReference?: ClassReference;
    }
}

export class Method extends AstNode {
    private parameters: Parameter[] = [];

    constructor(private readonly args: Method.Args) {
        super();
    }

    public addParameter(parameter: Parameter): void {
        this.parameters.push(parameter);
    }

    public write(writer: Writer): void {
        throw new Error("Method not implemented.");
    }

    public getParameters(): Parameter[] {
        return this.parameters;
    }

    public getInvocation(args: Map<Parameter, CodeBlock>, on?: CodeBlock): MethodInvocation {
        return new MethodInvocation({
            method: this,
            arguments: args,
            on
        });
    }

    public getInvocationFromExample(example: Map<string, unknown>, on?: CodeBlock): MethodInvocation {
        const args = new Map<Parameter, CodeBlock>();
        for (const parameter of this.parameters) {
            const value = example.get(parameter.name);
            if (value !== undefined) {
                // TODO: actually handle these examples
                args.set(parameter, new CodeBlock({ value: value as string }));
            }
        }
        return new MethodInvocation({
            method: this,
            arguments: args,
            on
        });
    }
}
