import { dynamic as DynamicSnippets, generatorExec as GeneratorExec } from "@fern-api/dynamic-ir-sdk/api";
import { DynamicSnippetsGenerator as Go } from "@fern-api/go-dynamic-snippets";
import { EndpointProvider } from "./EndpointProvider";
import { Language } from "./Language";
import go from "./config/go/config.json";
import ir from "./config/ir/ir.json";

export class SnippetResolver {
    private ir: DynamicSnippets.DynamicIntermediateRepresentation;

    constructor() {
        this.ir = ir as unknown as DynamicSnippets.DynamicIntermediateRepresentation;
    }

    public sdk(language: Language): EndpointProvider {
        return this.getGeneratorForLanguage({ ir: this.ir, language });
    }

    private getGeneratorForLanguage({
        ir,
        language,
    }: {
        ir: DynamicSnippets.DynamicIntermediateRepresentation;
        language: Language;
    }): EndpointProvider {
        switch (language) {
            case "go": {
                const config = this.getGeneratorConfigForLanguage(language);
                return new EndpointProvider({ ir, generator: new Go({ ir, config }) });
            }
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }

    private getGeneratorConfigForLanguage(language: Language): GeneratorExec.config.GeneratorConfig {
        switch (language) {
            case "go": {
                return go as unknown as GeneratorExec.config.GeneratorConfig;
            }
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }
}
