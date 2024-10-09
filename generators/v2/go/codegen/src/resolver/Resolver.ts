import { SnippetRequest } from "../snippets/generated/api";
import { DynamicSnippetGenerator } from "../snippets/DynamicSnippetGenerator";

export class Resolver {
    private generator: DynamicSnippetGenerator;

    constructor({ generator }: { generator: DynamicSnippetGenerator }) {
        this.generator = generator;
    }

    public resolve({ snippet }: { snippet: SnippetRequest }): string {
        return this.generator.generate({ snippet });
    }
}
