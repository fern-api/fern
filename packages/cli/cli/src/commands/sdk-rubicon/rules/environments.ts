import type { MapperRule } from "../types.js";
import { apiSection } from "./output.js";

/** One URL per environment, and the default environment. */
export const environmentsRule: MapperRule = {
    name: "environments",
    paths: [
        "api.environments[].name",
        "api.environments[].urls[].name",
        "api.environments[].urls[].url",
        "api.defaultEnvironment"
    ],
    apply(context) {
        const environments: Record<string, string> = {};
        (context.ir.api.environments ?? []).forEach((environment, index) => {
            const [only, ...rest] = environment.urls;
            if (only == null || rest.length > 0) {
                context.error(
                    `api.environments[${index}].urls`,
                    "RUBICON_MULTI_URL_ENVIRONMENT",
                    "Several URLs per environment need an endpoint-to-URL mapping, which SDK Config does not carry.",
                    "Use one URL per environment."
                );
                return;
            }
            environments[environment.name] = only.url;
        });
        if (Object.keys(environments).length > 0) {
            apiSection(context).environments = environments;
        }
        if (context.ir.api.defaultEnvironment != null) {
            apiSection(context)["default-environment"] = context.ir.api.defaultEnvironment;
        }
    }
};
