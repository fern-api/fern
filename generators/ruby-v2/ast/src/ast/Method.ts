import { KeywordParameter } from "./KeywordParameter";
import { KeywordSplatParameter } from "./KeywordSplatParameter";
import { Parameter } from "./Parameter";
import { PositionalParameter } from "./PositionalParameter";
import { PositionalSplatParameter } from "./PositionalSplatParameter";
import { YieldParameter } from "./YieldParameter";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Method {
    interface ParameterArgs {
        positional?: PositionalParameter[];
        keyword?: KeywordParameter[];
        positionalSplat?: PositionalSplatParameter;
        keywordSplat?: KeywordSplatParameter;
        yield?: YieldParameter;
    }

    interface Args {
        name: string;
        private_?: boolean;
        parameters?: ParameterArgs;
    }
}

export class Method extends AstNode {
    public readonly name: string;
    public readonly positionalParameters: PositionalParameter[];
    public readonly keywordParameters: KeywordParameter[];
    public readonly positionalSplatParameter: PositionalSplatParameter | null;
    public readonly keywordSplatParameter: KeywordSplatParameter | null;
    public readonly yieldParameter: YieldParameter | null;
    private readonly private_: boolean;
    private readonly statements: AstNode[] = [];

    constructor({ name, private_, parameters }: Method.Args) {
        super();

        this.name = name;
        this.private_ = private_ ?? false;
        this.positionalParameters = parameters?.positional ?? [];
        this.keywordParameters = parameters?.keyword ?? [];
        this.positionalSplatParameter = parameters?.positionalSplat ?? null;
        this.keywordSplatParameter = parameters?.keywordSplat ?? null;
        this.yieldParameter = parameters?.yield ?? null;
    }

    public write(writer: Writer): void {
        /*
        TODO: Typically, you would define `private` once in a Ruby file and every subsequent method definition will be
        considered private -- in practice, that will be difficult to implement
        */
        if (this.private_) {
            writer.write("private ");
        }

        writer.write(`def ${this.name}`);

        if (
            this.positionalParameters.length ||
            this.keywordParameters.length ||
            this.positionalSplatParameter ||
            this.keywordSplatParameter ||
            this.yieldParameter
        ) {
            writer.write("(");

            this.parameters.forEach((parameter, index) => {
                parameter.write(writer);
                if (index < this.parameters.length - 1) {
                    writer.write(", ");
                }
            });

            writer.write(")");
        }

        writer.newLine();

        if (this.statements.length) {
            writer.indent();
            this.statements.forEach((statement, index) => {
                statement.write(writer);
                if (index < this.statements.length - 1) {
                    writer.newLine();
                }
            });
            writer.dedent();
        }

        writer.write("end");

        writer.newLine();
    }

    get parameters(): Parameter[] {
        return [
            ...this.positionalParameters,
            ...this.keywordParameters,
            this.positionalSplatParameter,
            this.keywordSplatParameter,
            this.yieldParameter
        ].flatMap((param) => {
            return param !== null ? param : [];
        });
    }
}
