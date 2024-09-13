import { AbstractWriter } from "@fern-api/generator-commons";
import { BasePhpCustomConfigSchema } from "../../custom-config/BasePhpCustomConfigSchema";

export declare namespace Writer {
    interface Args {
        /* The namespace that is being written to */
        namespace: string;
        /* The root namespace of the project */
        rootNamespace: string;
        /* Custom generator config */
        customConfig: BasePhpCustomConfigSchema;
    }
}

export class Writer extends AbstractWriter {
    /* The namespace that is being written to */
    public namespace: string;
    /* The root namespace of the project */
    public rootNamespace: string;
    /* Custom generator config */
    public customConfig: BasePhpCustomConfigSchema;

    constructor({ namespace, rootNamespace, customConfig }: Writer.Args) {
        super();
        this.namespace = namespace;
        this.rootNamespace = rootNamespace;
        this.customConfig = customConfig;
    }

    public toString(): string {
        return this.buffer;
    }
}
