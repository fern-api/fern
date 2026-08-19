import { FernIr } from "@fern-fern/ir-sdk";
export function convertHttpPathToExpressRoute(path: FernIr.HttpPath): string {
    return path.parts.reduce((acc, part) => {
        return `${acc}:${part.pathParameter}${part.tail}`;
    }, path.head);
}
