import { Encoding } from "@fern-api/api";
import { PluginHelper, PluginHelpers } from "@fern-api/plugin-runner";
import { FernTypescriptHelper } from "@fern-typescript/helper-commons";
import JsonEncodingHelper from "@fern-typescript/json-encoding-helper";
import { loadHelperFromDisk } from "./loadHelperFromDisk";

type HelperName = string;
type HelperVersion = string;

interface HelperWithName {
    name: HelperName;
    helper: FernTypescriptHelper;
}

export class HelperManager {
    private loadedHelpers: Record<HelperName, Record<HelperVersion, FernTypescriptHelper>> = {};

    constructor(private helpers: PluginHelpers) {}

    public async getHandlersForEncoding(encoding: Encoding): Promise<FernTypescriptHelper.Encodings.EncodingHandlers> {
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

    private async getOrLoadHelper(helper: PluginHelper): Promise<FernTypescriptHelper> {
        let helpersWithName = this.loadedHelpers[helper.name];
        if (helpersWithName == null) {
            helpersWithName = {};
            this.loadedHelpers[helper.name] = helpersWithName;
        }

        let helperAtVersion = helpersWithName[helper.version];
        if (helperAtVersion == null) {
            helperAtVersion = await loadHelperFromDisk(helper.absolutePath);
            helpersWithName[helper.version] = helperAtVersion;
        }

        return helperAtVersion;
    }
}
