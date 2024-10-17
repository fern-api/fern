import { assertNever } from "@fern-api/core-utils";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Reference {
    type Args = NamedImport | ModuleImport;

    interface NamedImport {
        type: "named";
        /* The package or path to import from  */
        source: string;
        /* Name of the reference to import */
        name: string;
    }

    interface ModuleImport {
        type: "module";
        /* The package or path to import from  */
        source: string;
        /* The module to import from */
        module: string;
        /**
         * The path to access the reference from the module.
         * [module, ...name].join(".") is the reference
         */
        name: string[];
    }
}

export class Reference extends AstNode {
    private constructor(public readonly args: Reference.Args) {
        super();
    }

    public write(writer: Writer): void {
        writer.addReference(this);
        switch (this.args.type) {
            case "module":
                writer.write([this.args.module, ...this.args.name].join("."));
                break;
            case "named":
                writer.write(this.args.name);
                break;
            default:
                assertNever(this.args);
        }
    }

    public static module(import_: Omit<Reference.ModuleImport, "type">): Reference {
        return new Reference({ ...import_, type: "module" });
    }

    public static named(import_: Omit<Reference.NamedImport, "type">): Reference {
        return new Reference({ ...import_, type: "named" });
    }
}
