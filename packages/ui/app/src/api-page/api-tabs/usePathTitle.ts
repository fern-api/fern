import { assertNever } from "@fern-api/core-utils";
import { Loadable, mapLoadable } from "@fern-api/loadable";
import { getEndpointTitleAsString } from "../definition/endpoints/getEndpointTitleAsString";
import { useParsedDefinitionPath } from "../routes/useParsedDefinitionPath";

export function usePathTitle(path: string): Loadable<string | undefined> {
    const parsedPath = useParsedDefinitionPath(path);

    return mapLoadable(parsedPath, (loadedParsedPath) => {
        if (loadedParsedPath == null) {
            return undefined;
        }
        switch (loadedParsedPath.type) {
            case "type": {
                return loadedParsedPath.typeDefinition.name;
            }
            case "endpoint": {
                return getEndpointTitleAsString(loadedParsedPath.endpoint);
            }
            default:
                assertNever(loadedParsedPath);
        }
    });
}
