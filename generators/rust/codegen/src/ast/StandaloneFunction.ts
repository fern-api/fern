import { AstNode } from "./AstNode";
import { Attribute } from "./Attribute";
import { CodeBlock } from "./CodeBlock";
import { Type } from "./Type";
import { Visibility } from "./types";
import { writeVisibility } from "./utils/writeVisibility";
import { Writer } from "./Writer";

export declare namespace StandaloneFunction {
    interface Args {
        name: string;
        visibility?: Visibility;
        attributes?: Attribute[];
        parameters: FunctionParameter[];
        returnType?: Type;
        isAsync?: boolean;
        body?: CodeBlock;
    }
}

export interface FunctionParameter {
    name: string;
    parameterType: Type;
    isSelf?: boolean;
    isRef?: boolean;
    isMut?: boolean;
}

export class StandaloneFunction extends AstNode {
    public readonly name: string;
    public readonly visibility?: Visibility;
    public readonly attributes?: Attribute[];
    public readonly parameters: FunctionParameter[];
    public readonly returnType?: Type;
    public readonly isAsync: boolean;
    public readonly body?: CodeBlock;

    public constructor({
        name,
        visibility,
        attributes,
        parameters,
        returnType,
        isAsync = false,
        body
    }: StandaloneFunction.Args) {
        super();
        this.name = name;
        this.visibility = visibility;
        this.attributes = attributes;
        this.parameters = parameters;
        this.returnType = returnType;
        this.isAsync = isAsync;
        this.body = body;
    }

    public write(writer: Writer): void {
        // Write attributes at the start of the line (no indentation)
        if (this.attributes && this.attributes.length > 0) {
            this.attributes.forEach((attribute) => {
                attribute.write(writer);
                writer.newLine();
            });
        }

        // Write visibility without leading spaces
        if (this.visibility) {
            writeVisibility(writer, this.visibility);
            writer.write(" ");
        }

        // Write async keyword
        if (this.isAsync) {
            writer.write("async ");
        }

        // Write function declaration
        writer.write(`fn ${this.name}(`);

        // Write parameters
        this.parameters.forEach((param, index) => {
            if (index > 0) {
                writer.write(", ");
            }

            if (param.isSelf) {
                if (param.isRef) {
                    writer.write("&");
                }
                if (param.isMut) {
                    writer.write("mut ");
                }
                writer.write("self");
            } else {
                writer.write(param.name);
                writer.write(": ");
                if (param.isRef) {
                    writer.write("&");
                }
                param.parameterType.write(writer);
            }
        });

        writer.write(")");

        // Write return type
        if (this.returnType) {
            writer.write(" -> ");
            this.returnType.write(writer);
        }

        // Write body or semicolon
        if (this.body) {
            writer.write(" ");
            this.body.write(writer);
        } else {
            writer.write(";");
        }
    }
}
