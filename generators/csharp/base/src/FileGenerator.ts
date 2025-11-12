import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorContext } from "./cli";

export abstract class FileGenerator<GeneratedFile extends File, Context extends GeneratorContext = GeneratorContext> {
    constructor(protected readonly context: Context) {}

    protected get generation() {
        return this.context.generation;
    }
    protected get namespaces() {
        return this.generation.namespaces;
    }
    protected get registry() {
        return this.generation.registry;
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
    protected get model() {
        return this.generation.model;
    }
    protected get format() {
        return this.generation.format;
    }
    protected get csharp() {
        return this.generation.csharp;
    }
    protected get Types() {
        return this.generation.Types;
    }
    protected get System() {
        return this.generation.extern.System;
    }
    protected get NUnit() {
        return this.generation.extern.NUnit;
    }
    protected get OneOf() {
        return this.generation.extern.OneOf;
    }
    protected get Google() {
        return this.generation.extern.Google;
    }
    protected get WireMock() {
        return this.generation.extern.WireMock;
    }
    protected get Primitive() {
        return this.generation.Primitive;
    }
    protected get Value() {
        return this.generation.Value;
    }
    protected get Collection() {
        return this.generation.Collection;
    }
    protected get Special() {
        return this.generation.Special;
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
