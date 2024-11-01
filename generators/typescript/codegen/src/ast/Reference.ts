import { assertNever } from "@fern-api/core-utils";
import { AstNode, Writer } from "./core";

interface ModuleReference {
    /* The name of the module the reference is imported from */
    moduleName: string;
    /* Whether the reference is the default export of the module */
    defaultExport?: boolean;
}

export declare namespace Reference {
    interface Args {
        /* The name of the reference */
        name: string;
        /* The module it's from, if it's imported */
        module?: ModuleReference;
    }
}

export class Reference extends AstNode {
    public readonly name: string;
    public readonly module?: ModuleReference;

    constructor({ name, module }: Reference.Args) {
        super();
        this.name = name;
        this.module = module;
    }

    public write(writer: Writer): void {
        if (this.module?.defaultExport ?? false) {
            writer.addImport(this);
        }
        writer.write(this.name);
    }
}
