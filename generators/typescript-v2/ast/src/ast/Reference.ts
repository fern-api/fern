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
        /* The member name within the imported reference, if any (e.g. 'Address' in 'User.Address') */
        memberName?: string;
        /* The module it's from, if it's imported */
        importFrom?: ModuleImport;
    }
}

export class Reference extends AstNode {
    public readonly name: string;
    public readonly importFrom: Reference.ModuleImport | undefined;
    public readonly memberName: string | undefined;

    constructor({ name, importFrom, memberName }: Reference.Args) {
        super();
        this.name = name;
        this.importFrom = importFrom;
        this.memberName = memberName;
    }

    public write(writer: Writer): void {
        if (this.importFrom != null) {
            writer.addImport(this);
        }
        const prefix = this.importFrom?.type === "star" ? `${this.importFrom.starImportAlias}.` : "";
        const suffix = this.memberName != null ? `.${this.memberName}` : "";
        writer.write(`${prefix}${this.name}${suffix}`);
    }
}
