import { HttpPath } from "@fern-fern/ir-sdk/api";

export function convertHttpPathToExpressRoute(path: HttpPath): string {
    return path.parts.reduce((acc, part) => {
        return `${acc}:${part.pathParameter}${part.tail}`;
    }, path.head);
}
