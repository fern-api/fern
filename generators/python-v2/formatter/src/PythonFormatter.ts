import { AbstractFormatter } from "@fern-api/base-generator";
import init, { Config, format } from "@wasm-fmt/ruff_fmt";

export class PythonFormatter extends AbstractFormatter {
    private config: Config | undefined;
    private initialized: Promise<void> | undefined;

    constructor({ config }: { config?: Config } = {}) {
        super();
        this.config = config;
    }

    private ensureInitialized(): Promise<void> {
        if (this.initialized == null) {
            this.initialized = init().then(() => undefined);
        }
        return this.initialized;
    }

    public async format(content: string): Promise<string> {
        await this.ensureInitialized();
        return format(content, undefined, this.config);
    }

    public formatSync(content: string): string {
        return content;
    }
}
