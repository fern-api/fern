import { File } from "@fern-api/base-generator";
import { BaseCsharpCustomConfigSchema } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";

import { BaseCsharpGeneratorContext } from "./context/BaseCsharpGeneratorContext";

export abstract class FileGenerator<
    GeneratedFile extends File,
    CustomConfig extends BaseCsharpCustomConfigSchema,
    Context extends BaseCsharpGeneratorContext<CustomConfig>
> {
    constructor(protected readonly context: Context) {}

    protected get generation() {
        return this.context.common.generation;
    }
    protected get namespaces() {
        return this.generation.namespaces;
    }
    protected get registry() {
        return this.generation.registry;
    }
    protected get extern() {
        return this.generation.extern;
    }
    protected get settings() {
        return this.generation.settings;
    }
    protected get constants() {
        return this.generation.constants;
    }
    protected get names() {
        return this.generation.names;
    }
    protected get types() {
        return this.generation.types;
    }
    protected get model() {
        return this.generation.model;
    }
    protected get csharp() {
        return this.generation.csharp;
    }
    protected get System() {
        return this.extern.System;
    }
    protected get NUnit() {
        return this.extern.NUnit;
    }
    protected get OneOf() {
        return this.extern.OneOf;
    }
    protected get Google() {
        return this.extern.Google;
    }

    public generate(): GeneratedFile {
        if (this.shouldGenerate()) {
            this.context.logger.debug(`Generating ${this.getFilepath()}`);
        } else {
            this.context.logger.warn(
                `Internal warning: Generating ${this.getFilepath()} even though the file generator should not have been called.`
            );
        }
        return this.doGenerate();
    }

    public shouldGenerate(): boolean {
        return this.generation.initialize();
    }

    protected abstract doGenerate(): GeneratedFile;

    protected abstract getFilepath(): RelativeFilePath;
}
