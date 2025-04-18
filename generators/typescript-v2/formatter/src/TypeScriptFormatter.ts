import * as prettier from "prettier2";

import { AbstractFormatter } from "@fern-api/base-generator";

export class TypeScriptFormatter extends AbstractFormatter {
    public async format(content: string): Promise<string> {
        return this.format_(content);
    }

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
