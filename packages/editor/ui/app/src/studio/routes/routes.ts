import { constructParameterizedPaths, constructPaths } from "@fern-ui/routing-utils";

export const STUDIO = constructPaths({
    prefix: "",
    relativePath: "studio",
});

export const API_EDITOR_ITEM = constructParameterizedPaths({
    prefix: STUDIO.absolutePath,
    parameter: "SIDEBAR_ITEM_ID",
});
