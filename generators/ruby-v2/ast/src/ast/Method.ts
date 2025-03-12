import { Comment } from "./Comment";
import { KeywordParameter } from "./KeywordParameter";
import { KeywordSplatParameter } from "./KeywordSplatParameter";
import { Parameter } from "./Parameter";
import { PositionalParameter } from "./PositionalParameter";
import { PositionalSplatParameter } from "./PositionalSplatParameter";
import { Type } from "./Type";
import { YieldParameter } from "./YieldParameter";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export type MethodKind = "instance" | "class";
export const MethodKind = { Instance: "instance", Class_: "class" } as const;

export type MethodVisibility = "public" | "private" | "protected";
export const MethodVisibility = { Public: "public", Private: "private", Protected: "protected" } as const;

export declare namespace Method {
    export interface ParameterArgs {
        /* An array of this method's positional parameters. */
        positional?: PositionalParameter[];
        /* An array of this method's keyword parameters. */
        keyword?: KeywordParameter[];
        /* This method's positional splat parameter (`*name`). */
        positionalSplat?: PositionalSplatParameter;
        /* This method's keyword splat parameter (`**name`). */
        keywordSplat?: KeywordSplatParameter;
        /* This method's yield parameter (`&name`). */
        yield?: YieldParameter;
    }

    export interface Args {
        /* The name of the parameter. */
        name: string;
        /* The docstring for the method. */
        docstring?: string;
        /* Kind of method (instance or class). */
        kind?: MethodKind;
        /* Visibility of the method (public, private, or protected). */
        visibility?: MethodVisibility;
        /* The set of method parameters. */
        parameters?: ParameterArgs;
        /* The return type of the method. */
        returnType?: Type;
    }
}

export class Method extends AstNode {
    public readonly name: string;
    public readonly docstring: string | undefined;
    public readonly kind: MethodKind;
    public readonly positionalParameters: PositionalParameter[];
    public readonly keywordParameters: KeywordParameter[];
    public readonly positionalSplatParameter: PositionalSplatParameter | undefined;
    public readonly keywordSplatParameter: KeywordSplatParameter | undefined;
    public readonly yieldParameter: YieldParameter | undefined;
    private readonly visibility: MethodVisibility;
    private readonly statements: AstNode[] = [];
    public readonly returnType: Type;

    constructor({ name, docstring, kind, visibility, parameters, returnType }: Method.Args) {
        super();

        this.name = name;
        this.docstring = docstring;
        this.kind = kind ?? MethodKind.Instance;
        this.visibility = visibility ?? MethodVisibility.Public;
        this.positionalParameters = parameters?.positional ?? [];
        this.keywordParameters = parameters?.keyword ?? [];
        this.positionalSplatParameter = parameters?.positionalSplat;
        this.keywordSplatParameter = parameters?.keywordSplat;
        this.yieldParameter = parameters?.yield;
        this.returnType = returnType ?? Type.untyped();
    }

    public write(writer: Writer): void {
        if (this.docstring) {
            new Comment({ docs: this.docstring }).write(writer);
        }

        if (this.visibility !== MethodVisibility.Public) {
            writer.write(this.visibility);

            if (this.kind === MethodKind.Class_) {
                writer.write("_class_method");
            }

            writer.write(" ");
        }

        switch (this.kind) {
            case MethodKind.Instance:
                writer.write(`def ${this.name}`);
                break;

            case MethodKind.Class_:
                writer.write(`def self.${this.name}`);
                break;
        }

        if (this.parameters.length) {
            writer.write("(");

            writer.delimit({
                nodes: this.parameters,
                delimiter: ", ",
                writeFunction: (argument) => argument.write(writer)
            });

            writer.write(")");
        }

        if (this.statements.length) {
            writer.newLine();

            writer.indent();
            this.statements.forEach((statement, index) => {
                statement.write(writer);
                if (index < this.statements.length - 1) {
                    writer.newLine();
                }
            });
            writer.dedent();

            writer.write("end");
        } else {
            writer.write("; end");
        }

        writer.newLine();
    }

    public writeTypeDefinition(writer: Writer): void {
        writer.write(`def ${this.name}: (`);

        this.parameters.forEach((parameter, index) => {
            parameter.writeTypeDefinition(writer);

            if (index < this.parameters.length - 1) {
                writer.write(", ");
            }
        });

        writer.write(") -> ");

        this.returnType.write(writer);
    }

    /*
    NOTE: This returns the parameters in the following order: positional, keyword, positional splat, keyword splat,
    yield. In reality, you can mix and match _some_ of these, but by convention, parameters should be in this order.
    */
    get parameters(): Parameter[] {
        return [
            ...this.positionalParameters,
            ...this.keywordParameters,
            this.positionalSplatParameter,
            this.keywordSplatParameter,
            this.yieldParameter
        ].flatMap((param) => {
            return param !== undefined ? param : [];
        });
    }
}
