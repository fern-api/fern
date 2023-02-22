import { assertNever } from "@fern-api/core-utils";
import { getEndpointTitleAsString } from "../definition/endpoints/getEndpointTitleAsString";
import { useParsedDefinitionPath } from "../routes/useParsedDefinitionPath";

export function usePathTitle(path: string): string | undefined {
    const parsedPath = useParsedDefinitionPath(path);

    if (parsedPath.type !== "loaded" || parsedPath.value == null) {
        return undefined;
    }

    switch (parsedPath.value.type) {
        case "type": {
            return parsedPath.value.typeDefinition.name;
        }
        case "endpoint": {
            return getEndpointTitleAsString(parsedPath.value.endpoint);
        }
        default:
            assertNever(parsedPath.value);
    }
}
