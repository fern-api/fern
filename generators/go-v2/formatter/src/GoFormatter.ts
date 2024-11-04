import { AbstractFormatter } from "@fern-api/generator-commons";
import init, { format } from "@wasm-fmt/gofmt";

export class GoFormatter extends AbstractFormatter {
    public async format(content: string): Promise<string> {
        await init();
        return format(content);
    }
}
