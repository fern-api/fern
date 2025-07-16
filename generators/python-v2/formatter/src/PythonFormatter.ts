import init, { Config, format } from "@wasm-fmt/ruff_fmt"

import { AbstractFormatter } from "@fern-api/base-generator"

export class PythonFormatter extends AbstractFormatter {
    private config: Config | undefined

    constructor({ config }: { config?: Config } = {}) {
        super()
        this.config = config
    }

    public async format(content: string): Promise<string> {
        await init()
        return format(content, undefined, this.config)
    }

    public formatSync(content: string): string {
        return content
    }
}
