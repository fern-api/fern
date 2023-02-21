import { assertNever } from "@fern-api/core-utils";
import { useParsedPath } from "../../routes/definition/useParsedPath";
import { getEndpointTitleAsString } from "../definition/endpoints/getEndpointTitleAsString";

export function usePathTitle(path: string): string | undefined {
    const parsedPath = useParsedPath(path);

    if (parsedPath == null) {
        return undefined;
    }

    switch (parsedPath.type) {
        case "type": {
            return parsedPath.typeDefinition.name;
        }
        case "endpoint": {
            return getEndpointTitleAsString(parsedPath.endpoint);
        }
        default:
            assertNever(parsedPath);
    }
}
