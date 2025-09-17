import { AbstractFormatter, AbstractWriter, NopFormatter } from "@fern-api/browser-compatible-base-generator";

import { BaseRubyCustomConfigSchema } from "../../custom-config/BaseRubyCustomConfigSchema";

type RequirePath = string;
const TAB_SIZE = 2;

export declare namespace Writer {
    interface Args {
        /* Custom generator config */
        customConfig: BaseRubyCustomConfigSchema;
        /* Formatter used to format Ruby source files */
        formatter?: AbstractFormatter;
    }
}

export class Writer extends AbstractWriter {
    /* The package name that is being written to */
    public customConfig: BaseRubyCustomConfigSchema;
    /* Formatter used to format Ruby source files */
    public formatter: AbstractFormatter;

    /* Require statements */
    protected requires: Set<RequirePath> = new Set();

    constructor({ customConfig, formatter }: Writer.Args) {
        super();
        this.customConfig = customConfig;
        this.formatter = formatter ?? new NopFormatter();
    }

    /**
     * Adds the given require path to the rolling set.
     */
    public addRequire(requirePath: RequirePath): void {
        this.requires.add(requirePath);
    }

    // override abstract method
    protected getTabSize(): number {
        return TAB_SIZE;
    }
}
