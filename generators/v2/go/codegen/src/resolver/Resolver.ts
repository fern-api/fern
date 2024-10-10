import { FernGeneratorExec } from "@fern-api/generator-commons";
import fs from "fs";
import path from "path";
import { DynamicSnippetGenerator } from "../snippets/DynamicSnippetGenerator";
import { IntermediateRepresentation } from "../snippets/generated/api";
import { Generator } from "./Generator";
import { Language } from "./Language";

export class Resolver {
    private ir: IntermediateRepresentation;

    constructor() {
        this.ir = this.loadIR();
    }

    public resolve({ language }: { language: Language }): Generator {
        const generator = this.getGeneratorForLanguage({ ir: this.ir, language });
        return new Generator({ generator });
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
