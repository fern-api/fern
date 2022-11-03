import { constructParameterizedPaths, constructPaths } from "@fern-ui/routing-utils";

export const STUDIO = constructPaths({
    prefix: "",
    relativePath: "studio",
});

export const API_CONFIGURATION = constructPaths({
    prefix: STUDIO.absolutePath,
    relativePath: "api-configuration",
});

export const SDK_CONFIGURATION = constructPaths({
    prefix: STUDIO.absolutePath,
    relativePath: "sdks",
});

export const API_EDITOR_ITEM = constructParameterizedPaths({
    prefix: STUDIO.absolutePath,
    parameter: "EDITOR_ITEM_ID",
});

export const API_EDITOR_TYPES_GROUP = constructPaths({
    prefix: API_EDITOR_ITEM.absolutePath,
    relativePath: "types",
});

export const API_EDITOR_ERRORS_GROUP = constructPaths({
    prefix: API_EDITOR_ITEM.absolutePath,
    relativePath: "errors",
});
