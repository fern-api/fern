import { Encoding } from "@fern-api/api";
import { GeneratorHelperReference, GeneratorHelpers } from "@fern-api/local-workspace-runner";
import { Encoder, FernTypescriptHelper } from "@fern-typescript/helper-utils";
import { helper as JsonEncodingHelper } from "@fern-typescript/json-encoding-helper";

type HelperName = string;
type HelperVersion = string;

interface HelperWithName {
    name: HelperName;
    helper: FernTypescriptHelper;
}

export class HelperManager {
    private loadedHelpers: Record<HelperName, Record<HelperVersion, FernTypescriptHelper>> = {};

    constructor(private helpers: GeneratorHelpers) {}

    public getHelpers(): GeneratorHelpers {
        return this.helpers;
    }

    public async getOrLoadHelper(helperReference: GeneratorHelperReference): Promise<FernTypescriptHelper> {
        const helpersWithName = (this.loadedHelpers[helperReference.name] ??= {});
        const helperAtVersion = (helpersWithName[helperReference.version] ??= {});
        return helperAtVersion;
    }

    public async getEncoderForEncoding(encoding: Encoding): Promise<Encoder> {
        const { helper, name: helperName } = await this.getHelperForEncoding(encoding);

        const encodingStr = Encoding._visit(encoding, {
            json: () => "json",
            custom: (customEncoding) => customEncoding.encoding,
            _unknown: () => {
                throw new Error("Unknown encoding type: " + encoding._type);
            },
        });

        const handlerForEncoding = helper.encodings?.[encodingStr];
        if (handlerForEncoding == null) {
            throw new Error(`Helper ${helperName} does not handle encoding ` + encodingStr);
        }
        return handlerForEncoding;
    }

    private async getHelperForEncoding(encoding: Encoding): Promise<HelperWithName> {
        switch (encoding._type) {
            case "json":
                return {
                    name: "json-encoding-helper",
                    helper: JsonEncodingHelper,
                };
            case "custom": {
                const helperForEncoding = this.helpers.encodings[encoding.encoding];
                if (helperForEncoding == null) {
                    throw new Error("No helper is registered for encoding " + encoding.encoding);
                }
                return {
                    name: `${helperForEncoding.name}@${helperForEncoding.version}`,
                    helper: await this.getOrLoadHelper(helperForEncoding),
                };
            }
        }
    }
}
