import { AstNode, Writer } from "./core";

export declare namespace Reference {
    type ModuleImport = DefaultImport | NamedImport | StarImport;

    interface DefaultImport {
        type: "default";
        moduleName: string;
    }

    interface NamedImport {
        type: "named";
        moduleName: string;
    }

    interface StarImport {
        type: "star";
        moduleName: string;
        starImportAlias: string;
    }

    interface Args {
        /* The name of the reference */
        name: string;
        /* The module it's from, if it's imported */
        importFrom?: ModuleImport;
    }
}

export class Reference extends AstNode {
    public readonly name: string;
    public readonly importFrom?: Reference.ModuleImport;

    constructor({ name, importFrom }: Reference.Args) {
        super();
        this.name = name;
        this.importFrom = importFrom;
    }

    public write(writer: Writer): void {
        if (this.importFrom != null) {
            writer.addImport(this);
        }
        const prefix = this.importFrom?.type === "star" ? `${this.importFrom.starImportAlias}.` : "";
        writer.write(`${prefix}${this.name}`);
    }
}
