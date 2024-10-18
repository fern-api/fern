import { assertNever } from "@fern-api/core-utils";
import { AstNode } from "./AstNode";
import { Writer } from "./Writer";

export declare namespace Reference {
    type Args = NamedImport | ModuleImport | RootModuleImport;

    interface NamedImport {
        type: "named";
        /* The package or path to import from  */
        source: PackageOrPath;
        /* Name of the reference to import */
        name: string;
    }

    interface ModuleImport {
        type: "module";
        /* The package or path to import from  */
        source: PackageOrPath;
        /* The module to import from */
        module: string;
        /**
         * The path to access the reference from the module.
         * [module, ...name].join(".") is the reference
         */
        path?: string[];
        /* Name of the reference to import */
        name: string;
    }

    interface RootModuleImport {
        type: "root";
        /* The module to import from */
        module: string;
        /**
         * The path to access the reference from the module.
         * [module, ...name].join(".") is the reference
         */
        path?: string[];
        /* Name of the reference to import */
        name: string;
    }

    type PackageOrPath = Package | Path;

    interface Package {
        type: "package";
        packageName: string;
    }

    interface Path {
        type: "path";
        pathFromRoot: string;
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
                writer.write([this.args.module, ...(this.args.path ?? []), this.args.name].join("."));
                break;
            case "named":
                writer.write(this.args.name);
                break;
            case "root":
                writer.write([this.args.module, ...(this.args.path ?? []), this.args.name].join("."));
                break;
            default:
                assertNever(this.args);
        }
    }

    public static rootModule(import_: Omit<Reference.RootModuleImport, "type">): Reference {
        return new Reference({ ...import_, type: "root" });
    }

    public static module(import_: Omit<Reference.ModuleImport, "type">): Reference {
        return new Reference({ ...import_, type: "module" });
    }

    public static named(import_: Omit<Reference.NamedImport, "type">): Reference {
        return new Reference({ ...import_, type: "named" });
    }
}
