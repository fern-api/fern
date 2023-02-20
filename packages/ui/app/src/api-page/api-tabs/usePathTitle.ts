import { assertNever } from "@fern-api/core-utils";
import { useParsedPath } from "../../routes/definition/useParsedPath";

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
            if (parsedPath.endpoint.displayName != null) {
                return parsedPath.endpoint.displayName;
            }
            return parsedPath.endpoint.path.parts
                .map((part) =>
                    part._visit({
                        pathParameter: (pathParameter) => `:${pathParameter}`,
                        literal: (literal) => literal,
                        _other: () => "?",
                    })
                )
                .join("");
        }
        default:
            assertNever(parsedPath);
    }
}
