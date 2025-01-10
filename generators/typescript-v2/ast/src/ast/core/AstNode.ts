import * as prettier from "prettier2";

import { AbstractAstNode } from "@fern-api/browser-compatible-base-generator";

import { Writer } from "./Writer";
import { TypescriptCustomConfigSchema } from "../../custom-config/TypescriptCustomConfigSchema";

export abstract class AstNode extends AbstractAstNode {
    /**
     * Writes the node to a string.
     */
    public async toString({ customConfig }: { customConfig: TypescriptCustomConfigSchema | undefined }): Promise<string> {
        const writer = new Writer({ customConfig });
        this.write(writer);
        return writer.toString();
    }

    public toStringSync({ customConfig }: { customConfig: TypescriptCustomConfigSchema | undefined }): string {
        const writer = new Writer({ customConfig });
        this.write(writer);
        return writer.toString();
    }

    public toStringFormatted({ customConfig }: { customConfig: TypescriptCustomConfigSchema | undefined }): string {
        return prettier.format(this.toStringSync({ customConfig }), {
            parser: "typescript",
            tabWidth: 4,
            printWidth: 120
        });
    }
}
