import { DynamicSnippetGenerator } from "../snippets/DynamicSnippetGenerator";
import { SnippetRequest } from "../snippets/generated/api";

export class Generator {
    private generator: DynamicSnippetGenerator;

    constructor({ generator }: { generator: DynamicSnippetGenerator }) {
        this.generator = generator;
    }

    public generate(request: SnippetRequest): string {
        return this.generator.generate(request);
    }
}
