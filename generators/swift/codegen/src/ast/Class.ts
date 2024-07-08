import { AstNode, Writer } from "@fern-api/generator-commons";
import Lang from "../lang";
import { AccessLevel } from "./AccessLevel";
import { Func } from "./Func";
import { Import } from "./Import";

export declare namespace Class {
    interface Args {
        imports?: Import[];
        accessLevel?: AccessLevel;
        name: string;
        functions: Func[];
    }
}

export class Class extends AstNode {

    public readonly imports?: Import[];
    public readonly accessLevel?: AccessLevel;
    public readonly name: string;
    public readonly functions?: Func[];

    constructor({ 
        imports, 
        accessLevel, 
        name,
        functions
    }: Class.Args) {
        super(Lang.indentSize);
        this.imports = imports;
        this.accessLevel = accessLevel;
        this.name = name;
        this.functions = functions;
    }

    public write(writer: Writer): void {

        // e.g. import PackageName
        if (this.imports) {
            this.imports.forEach(imp => {
                writer.writeNode(imp);
            });
            writer.newLine();
        }

        // e.g. public class ClassName {
        const title = [this.accessLevel, "class", this.name,  "{"].filter(value => value !== undefined).join(" ");

        writer.write(title);

        writer.newLine();

            writer.openIndent();

            if (this.functions) {
                this.functions.forEach(func => {
                    writer.writeNode(func);
                    writer.newLine();
                });
            }

            writer.closeIndent();

        writer.newLine();

        writer.write("}");

        // Common for swift classes to have an extra line at bottom of file
        writer.newLine();

    }

}
