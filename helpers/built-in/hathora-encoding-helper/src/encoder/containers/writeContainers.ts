import { ContainerType } from "@fern-api/api";
import { FernWriters, getTextOfTsNode } from "@fern-typescript/commons";
import { tsMorph } from "@fern-typescript/helper-utils";
import { getEncoderNameForContainer } from "../../constants";
import { assertNever } from "../../utils/assertNever";
import { constructEncodeMethods, EncodeMethods } from "../constructEncodeMethods";
import { getEncodeMethodsForList } from "./getEncodeMethodsForList";
import { getEncodeMethodsForMap } from "./getEncodeMethodsForMap";
import { getEncodeMethodsForOptional } from "./getEncodeMethodsForOptional";

export function writeContainers(): tsMorph.WriterFunction {
    const writer = FernWriters.object.writer({ newlinesBetweenProperties: true });

    for (const containerType of ContainerType._types()) {
        writer.addProperty({
            key: getEncoderNameForContainer(containerType),
            value: getTextOfTsNode(
                constructEncodeMethods({
                    methods: getEncodeMethodsForContainer({ containerType }),
                })
            ),
        });
    }

    return writer.toFunction();
}

function getEncodeMethodsForContainer({ containerType }: { containerType: ContainerType["_type"] }): EncodeMethods {
    switch (containerType) {
        case "list":
        case "set": // Fern sets are just treated as lists in TS
            return getEncodeMethodsForList();
        case "map":
            return getEncodeMethodsForMap();
        case "optional":
            return getEncodeMethodsForOptional();
        default:
            assertNever(containerType);
    }
}
