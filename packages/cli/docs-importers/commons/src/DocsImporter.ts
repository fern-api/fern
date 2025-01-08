import { TaskContext } from "@fern-api/task-context";

import { FernDocsBuilder } from "./FernDocsBuilder";

export declare namespace DocsImporter {
    interface BaseArgs {
        context: TaskContext;
    }
}

export abstract class DocsImporter<Args> {
    protected context: TaskContext;

    constructor({ context }: DocsImporter.BaseArgs) {
        this.context = context;
    }

    public abstract import({ args, builder }: { args: Args; builder: FernDocsBuilder }): Promise<void>;
}
