import { IntermediateRepresentation } from "../snippets/generated/api";
import { DynamicSnippetGenerator } from "../snippets/DynamicSnippetGenerator";
import { Language } from "./Language";
import { Resolver } from "./Resolver";
import { FernGeneratorExec } from "@fern-api/generator-commons";
import fs from "fs";
import path from "path";

export class ResolverProvider {
    private ir: IntermediateRepresentation;

    constructor() {
        this.ir = this.loadIR();
    }

    public getResolver({ language }: { language: Language }): Resolver {
        const generator = this.getGeneratorForLanguage({ ir: this.ir, language });
        return new Resolver({ generator });
    }

    private getGeneratorForLanguage({
        ir,
        language
    }: {
        ir: IntermediateRepresentation;
        language: Language;
    }): DynamicSnippetGenerator {
        switch (language) {
            case "go": {
                const config = this.getGeneratorConfigForLanguage(language);
                return new DynamicSnippetGenerator({ ir, config });
            }
            case "typescript":
                throw new Error("TODO: Implement me!");
            default:
                throw new Error(`Unknown language: ${language}`);
        }
    }

    private getGeneratorConfigForLanguage(language: Language): FernGeneratorExec.config.GeneratorConfig {
        switch (language) {
            case "go":
                return JSON.parse(
                    fs.readFileSync(path.join(__dirname, "go", "config.json"), "utf-8")
                ) as FernGeneratorExec.config.GeneratorConfig;
            case "typescript":
                throw new Error("TODO: Implement me!");
            default:
                throw new Error(`Unknown language: ${language}`);
        }
    }

    private loadIR(): IntermediateRepresentation {
        return JSON.parse(
            fs.readFileSync(path.join(__dirname, "config", "ir.json"), "utf-8")
        ) as IntermediateRepresentation;
    }
}
