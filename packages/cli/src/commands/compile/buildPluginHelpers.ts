import { CustomWireMessageEncoding } from "@fern-api/api";
import { PluginHelper, PluginInvocation } from "@fern-api/compiler-commons";
import { PluginHelpers } from "@fern-api/plugin-runner";
import { getDownloadPathForHelper } from "./downloadHelper";

export declare namespace buildPluginHelpers {
    export interface Args {
        pluginInvocation: PluginInvocation;
        nonStandardEncodings: CustomWireMessageEncoding[];
        absolutePathToWorkspaceTempDir: string;
    }
}

export function buildPluginHelpers({
    pluginInvocation,
    nonStandardEncodings,
    absolutePathToWorkspaceTempDir,
}: buildPluginHelpers.Args): PluginHelpers {
    const helpers: PluginHelpers = { encodings: {} };

    if (nonStandardEncodings.length > 0) {
        const uniqueNonStandardEncodings = nonStandardEncodings.reduce((unique, { encoding }) => {
            unique.add(encoding);
            return unique;
        }, new Set<string>());

        uniqueNonStandardEncodings.forEach((encoding) => {
            const helperForEncoding = getHelperForEncoding({ encoding, pluginInvocation });
            helpers.encodings[encoding] = {
                name: helperForEncoding.name,
                version: helperForEncoding.version,
                absolutePath: getDownloadPathForHelper({
                    helper: helperForEncoding,
                    absolutePathToWorkspaceTempDir,
                }),
            };
        });
    }

    return helpers;
}

function getHelperForEncoding({
    encoding,
    pluginInvocation,
}: {
    encoding: string;
    pluginInvocation: PluginInvocation;
}): PluginHelper {
    const [helper, ...rest] = pluginInvocation.helpers.filter((helper) => doesHelperHandleEncoding(helper, encoding));
    if (helper == null) {
        throw new Error("No helpers handle the encoding: " + encoding);
    }
    if (rest.length > 0) {
        throw new Error("Multiple helpers handle the encoding: " + encoding);
    }
    return helper;
}

function doesHelperHandleEncoding(helper: PluginHelper, encoding: string): boolean {
    if (encoding !== "hathora") {
        return false;
    }
    return helper.name === "@fern-typescript/hathora-encoding-helper";
}
