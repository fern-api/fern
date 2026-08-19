import { File } from "@fern-api/base-generator";
import { Generation } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorContext } from "./cli/index.js";

export abstract class FileGenerator<GeneratedFile extends File, Context extends GeneratorContext = GeneratorContext> {
    constructor(protected readonly context: Context) {}

    protected get generation(): Generation {
        return this.context.generation;
    }
    protected get case(): Generation["case"] {
        return this.generation.case;
    }
    protected get namespaces(): Generation["namespaces"] {
        return this.generation.namespaces;
    }
    protected get registry(): Generation["registry"] {
        return this.generation.registry;
    }
    protected get settings(): Generation["settings"] {
        return this.generation.settings;
    }
    protected get constants(): Generation["constants"] {
        return this.generation.constants;
    }
    protected get names(): Generation["names"] {
        return this.generation.names;
    }
    protected get model(): Generation["model"] {
        return this.generation.model;
    }
    protected get format(): Generation["format"] {
        return this.generation.format;
    }
    protected get csharp(): Generation["csharp"] {
        return this.generation.csharp;
    }
    protected get Types(): Generation["Types"] {
        return this.generation.Types;
    }
    protected get System(): Generation["extern"]["System"] {
        return this.generation.extern.System;
    }
    protected get NUnit(): Generation["extern"]["NUnit"] {
        return this.generation.extern.NUnit;
    }
    protected get OneOf(): Generation["extern"]["OneOf"] {
        return this.generation.extern.OneOf;
    }
    protected get Google(): Generation["extern"]["Google"] {
        return this.generation.extern.Google;
    }
    protected get WireMock(): Generation["extern"]["WireMock"] {
        return this.generation.extern.WireMock;
    }
    protected get Primitive(): Generation["Primitive"] {
        return this.generation.Primitive;
    }
    protected get Value(): Generation["Value"] {
        return this.generation.Value;
    }
    protected get Collection(): Generation["Collection"] {
        return this.generation.Collection;
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
