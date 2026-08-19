import { Writer } from "./core/Writer.js";
import { Reference } from "./Reference.js";

/**
 * Represents a module-level import (e.g., `import datetime`).
 * Unlike a regular Reference which produces `from X import Y`,
 * a ModuleImport produces `import X`.
 */
export declare namespace ModuleImport {
    interface Args {
        /* The module to import (e.g., "datetime", "uuid") */
        module: string;
    }
}

export class ModuleImport extends Reference {
    public constructor({ module }: ModuleImport.Args) {
        super({ name: module, modulePath: [module] });
    }

    public write(writer: Writer): void {
        throw new Error("Not intended to be written outside the context of a PythonFile.");
    }
}
