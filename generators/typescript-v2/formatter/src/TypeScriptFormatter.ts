import { AbstractFormatter } from "@fern-api/base-generator";
import * as prettier from "prettier2";

export class TypeScriptFormatter extends AbstractFormatter {
    public async format(content: string): Promise<string> {
        return this.format_(content);
    }
// CHRISM - force change in v2
    public formatSync(content: string): string {
        return this.format_(content);
    }

    private format_(content: string): string {
        return prettier.format(content, {
            parser: "typescript",
            tabWidth: 4,
            printWidth: 120
        });
    }
}
