import type { MapperRule } from "../types.js";
import { apiSection } from "./output.js";

/**
 * `api.headers` to generators.yml `api.headers`. A header the spec already sends is skipped, or Fern
 * sees it twice.
 *
 * `fern sdk migrate` 5.148.2 writes an API-key security scheme's key as a header name (`apiKey`
 * instead of `X-Api-Key`), so a header that matches a header API-key scheme key is skipped too, with
 * a warning.
 */
export const headersRule: MapperRule = {
    name: "headers",
    paths: ["api.headers[].name", "api.headers[].environmentVariable", "api.headers[].description"],
    apply(context) {
        const declared = new Set(context.input.specFacts.flatMap((facts) => facts?.declaredHeaders ?? []));
        const schemeKeys = new Set(context.input.specFacts.flatMap((facts) => facts?.schemeKeys ?? []));
        const headers: Record<string, unknown> = {};
        (context.ir.api.headers ?? []).forEach((header, index) => {
            const name = header.name.toLowerCase();
            if (declared.has(name)) {
                return;
            }
            if (schemeKeys.has(name)) {
                context.warn(
                    `api.headers[${index}].name`,
                    "RUBICON_HEADER_IS_SCHEME_KEY",
                    `Header '${header.name}' matches an API-key security scheme key, not a header name, so it is skipped.`,
                    "`fern sdk migrate` writes scheme keys as header names; correct the header name in sdk-config.yml."
                );
                return;
            }
            // `name` is Fern's SDK parameter name, not the wire name, so it is left out.
            headers[header.name] = {
                type: "string",
                ...(header.environmentVariable != null ? { env: header.environmentVariable } : {}),
                ...(header.description != null ? { docs: header.description } : {})
            };
        });
        if (Object.keys(headers).length > 0) {
            apiSection(context).headers = headers;
        }
    }
};
