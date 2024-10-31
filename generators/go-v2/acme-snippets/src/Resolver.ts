import { FernGeneratorExec } from "@fern-api/generator-commons";
import fs from "fs";
import path from "path";
import { AbstractDynamicSnippetsGenerator, AbstractDynamicSnippetsGeneratorContext } from "@fern-api/dynamic-snippets";
import { DynamicSnippetsGenerator as Go } from "@fern-api/go-dynamic-snippets";
import { dynamic as DynamicSnippets } from "@fern-fern/ir-sdk/api";
import { Language } from "./Language";
import { CONFIG_DIR } from "./constants";

export class Resolver {
    private ir: DynamicSnippets.DynamicIntermediateRepresentation;

    constructor() {
        this.ir = this.loadIR();
    }

    public resolve({
        language
    }: {
        language: Language;
    }): AbstractDynamicSnippetsGenerator<AbstractDynamicSnippetsGeneratorContext> {
        return this.getGeneratorForLanguage({ ir: this.ir, language });
    }

    private getGeneratorForLanguage({
        ir,
        language
    }: {
        ir: DynamicSnippets.DynamicIntermediateRepresentation;
        language: Language;
    }): AbstractDynamicSnippetsGenerator<AbstractDynamicSnippetsGeneratorContext> {
        switch (language) {
            case "go": {
                const config = this.getGeneratorConfigForLanguage(language);
                return new Go({ ir, config });
            }
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }

    private getGeneratorConfigForLanguage(language: Language): FernGeneratorExec.config.GeneratorConfig {
        switch (language) {
            case "go": {
                const content = this.readConfigFileAsString("go/config.json");
                return JSON.parse(content) as FernGeneratorExec.config.GeneratorConfig;
            }
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }

    private loadIR(): DynamicSnippets.DynamicIntermediateRepresentation {
        const content = this.readConfigFileAsString("ir/ir.json");
        return JSON.parse(content) as DynamicSnippets.DynamicIntermediateRepresentation;
    }

    private readConfigFileAsString(filepath: string): string {
        return fs.readFileSync(path.join(CONFIG_DIR, filepath), "utf-8");
    }
}
