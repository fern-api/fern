import init, { format } from "@wasm-fmt/gofmt";

import { AbstractFormatter } from "@fern-api/base-generator";

export class GoFormatter extends AbstractFormatter {
    public async format(content: string): Promise<string> {
        await init();
        return format(content);
    }

    public formatSync(content: string): string {
        return content;
    }
}
