import { FERN_TYPE_EXTENSIONS } from "@fern-api/openapi-ir-parser";
import { BundleOptions } from "@redocly/openapi-core/lib/bundle";
import { Config } from "@redocly/openapi-core";

export const DEFAULT_OPENAPI_BUNDLE_OPTIONS: BundleOptions = {
    config: new Config(
        {
            apis: {},
            styleguide: {
                plugins: [FERN_TYPE_EXTENSIONS],
                rules: {
                    spec: "warn"
                }
            }
        },
        undefined
    ),
    dereference: false,
    removeUnusedComponents: false,
    keepUrlRefs: true
};
