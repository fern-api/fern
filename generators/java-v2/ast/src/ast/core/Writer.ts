import { AbstractFormatter, AbstractWriter, NopFormatter } from "@fern-api/browser-compatible-base-generator";

import { BaseJavaCustomConfigSchema } from "../../custom-config/BaseJavaCustomConfigSchema.js";

type PackageName = string;

export declare namespace Writer {
    interface Args {
        /* The package name of the file */
        packageName: string;
        /* Custom generator config */
        customConfig: BaseJavaCustomConfigSchema;
        /* Formatter used to format Java source files */
        formatter?: AbstractFormatter;
    }
}

export class Writer extends AbstractWriter {
    /* The package name that is being written to */
    public packageName: string;
    /* Custom generator config */
    public customConfig: BaseJavaCustomConfigSchema;
    /* Formatter used to format Java source files */
    public formatter: AbstractFormatter;

    /* Import statements */
    protected imports: Set<PackageName> = new Set();
    /* Maps an imported simple class name to the package that claimed it */
    protected importedSimpleNames: Map<string, string> = new Map();

    constructor({ packageName, customConfig, formatter }: Writer.Args) {
        super();
        this.packageName = packageName;
        this.customConfig = customConfig;
        this.formatter = formatter ?? new NopFormatter();
    }

    /**
     * Adds the given package name to the rolling set.
     */
    public addImport(packageName: string): void {
        this.imports.add(packageName);
    }

    /**
     * Records a reference to a class and determines how it should be written.
     *
     * The first class to claim a given simple name is imported and can be
     * referenced unqualified. Any later class that shares the same simple name
     * but lives in a different package cannot be imported (it would clash), so
     * the caller must write it using its fully-qualified name instead.
     */
    public addReference({ name, packageName }: { name: string; packageName: string }): {
        shouldFullyQualify: boolean;
    } {
        const claimedBy = this.importedSimpleNames.get(name);
        if (claimedBy == null) {
            this.importedSimpleNames.set(name, packageName);
            this.imports.add(`${packageName}.${name}`);
            return { shouldFullyQualify: false };
        }
        if (claimedBy === packageName) {
            this.imports.add(`${packageName}.${name}`);
            return { shouldFullyQualify: false };
        }
        return { shouldFullyQualify: true };
    }

    /**
     * Gets the current set of imports.
     */
    public getImports(): Set<PackageName> {
        return new Set(this.imports);
    }
}
