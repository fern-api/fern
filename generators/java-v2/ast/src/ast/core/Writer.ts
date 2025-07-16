import { AbstractFormatter, AbstractWriter, NopFormatter } from "@fern-api/browser-compatible-base-generator"

import { BaseJavaCustomConfigSchema } from "../../custom-config/BaseJavaCustomConfigSchema"

type PackageName = string

export declare namespace Writer {
    interface Args {
        /* The package name of the file */
        packageName: string
        /* Custom generator config */
        customConfig: BaseJavaCustomConfigSchema
        /* Formatter used to format Java source files */
        formatter?: AbstractFormatter
    }
}

export class Writer extends AbstractWriter {
    /* The package name that is being written to */
    public packageName: string
    /* Custom generator config */
    public customConfig: BaseJavaCustomConfigSchema
    /* Formatter used to format Java source files */
    public formatter: AbstractFormatter

    /* Import statements */
    protected imports: Set<PackageName> = new Set()

    constructor({ packageName, customConfig, formatter }: Writer.Args) {
        super()
        this.packageName = packageName
        this.customConfig = customConfig
        this.formatter = formatter ?? new NopFormatter()
    }

    /**
     * Adds the given package name to the rolling set.
     */
    public addImport(packageName: string): void {
        this.imports.add(packageName)
    }
}
