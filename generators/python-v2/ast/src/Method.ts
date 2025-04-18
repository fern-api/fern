import { python } from ".";
import { CodeBlock } from "./CodeBlock";
import { Decorator } from "./Decorator";
import { Parameter } from "./Parameter";
import { Type } from "./Type";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export enum ClassMethodType {
    STATIC,
    INSTANCE,
    CLASS
}

export declare namespace Method {
    interface Args {
        /* The name of the method */
        name: string;
        /* The parameters of the method */
        parameters?: Parameter[];
        /* The return type of the method */
        return_?: Type;
        /* The docstring for the method */
        docstring?: string;
        /* The type of the method if defined within the context of a class */
        type?: ClassMethodType;
        /* Whether the method is a static method */
        static_?: boolean;
        /* The decorators that should be applied to this method */
        decorators?: Decorator[];
    }
}

export class Method extends AstNode {
    public readonly name: string;
    public readonly return: Type | undefined;
    public readonly docstring: string | undefined;
    public readonly type: ClassMethodType | undefined;
    private readonly parameters: Parameter[];
    private readonly decorators: Decorator[];
    private readonly statements: AstNode[] = [];
    private readonly static_: boolean;

    constructor({ static_, name, parameters, return_, docstring, type, decorators }: Method.Args) {
        super();
        this.name = name;
        this.parameters = parameters ?? [];
        this.return = return_;
        this.docstring = docstring;
        this.type = type;
        this.decorators = decorators ?? [];
        this.static_ = static_ ?? false;

        this.parameters.forEach((parameter) => {
            this.inheritReferences(parameter);
        });

        this.inheritReferences(this.return);

        this.decorators.forEach((decorator) => {
            this.inheritReferences(decorator);
        });

        this.statements.forEach((statements) => {
            this.inheritReferences(statements);
        });
    }

    public addStatement(statement: AstNode): void {
        this.statements.push(statement);
        this.inheritReferences(statement);
    }

    public write(writer: Writer): void {
        if (this.static_) {
            this.decorators.push(
                python.decorator({
                    callable: python.codeBlock("staticmethod")
                })
            );
        }

        // Write decorators
        this.decorators.forEach((decorator) => {
            decorator.write(writer);
        });

        if (this.type === ClassMethodType.CLASS) {
            python
                .decorator({
                    callable: new CodeBlock("classmethod")
                })
                .write(writer);
        } else if (this.type === ClassMethodType.STATIC) {
            python
                .decorator({
                    callable: new CodeBlock("staticmethod")
                })
                .write(writer);
        }

        // Write method signature
        writer.write(`def ${this.name}(`);
        if (this.type === ClassMethodType.INSTANCE) {
            writer.write("self");
            if (this.parameters.length > 0) {
                writer.write(", ");
            }
        } else if (this.type === ClassMethodType.CLASS) {
            writer.write("cls");
            if (this.parameters.length > 0) {
                writer.write(", ");
            }
        }
        this.parameters.forEach((param, index) => {
            param.write(writer);
            if (index < this.parameters.length - 1) {
                writer.write(", ");
            }
        });
        writer.write(")");

        // Write return type if specified
        if (this.return) {
            writer.write(" -> ");
            this.return.write(writer);
        }

        writer.write(":");
        writer.newLine();

        // Write docstring if specified
        if (this.docstring) {
            writer.indent();
            writer.write('"""');
            writer.write(this.docstring);
            writer.write('"""');
            writer.newLine();
            writer.dedent();
        }

        // Write method body
        if (this.statements.length) {
            writer.indent();
            this.statements.forEach((statement, index) => {
                statement.write(writer);
                if (index < this.statements.length - 1) {
                    writer.newLine();
                }
            });
            writer.dedent();
        } else {
            writer.indent();
            writer.write("pass");
            writer.dedent();
        }
        writer.newLine();
    }
}
