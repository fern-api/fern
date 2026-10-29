import type { SdkConfigV1Document } from "@postman/sdk-config/sdk-config/v1";

type SdkConfigV1DocumentTarget = SdkConfigV1Document["targets"][number];

/**
 * An SDK Config MCP target can ask for `hosted` delivery. The CLI makes that deployment itself after
 * generation, so sdk-gen-api only ever builds a download for it. The target sent to sdk-gen-api says
 * `zip`, which every sdk-gen-api version accepts, instead of a delivery it may not know.
 */
export function toSdkGenApiTarget(target: SdkConfigV1DocumentTarget): SdkConfigV1DocumentTarget {
    if (target.language === "mcp" && target.output?.delivery === "hosted") {
        return { ...target, output: { delivery: "zip" } };
    }
    return target;
}
