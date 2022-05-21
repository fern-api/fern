import { ContainerType } from "@fern-api/api";
import { FernWriters } from "@fern-typescript/commons";
import { createPrinter, TsMorph, tsMorph } from "@fern-typescript/helper-utils";
import { getEncoderNameForContainer } from "../../constants";
import { assertNever } from "../../utils/assertNever";
import { constructEncodeMethods, EncodeMethods } from "../constructEncodeMethods";
import { getEncodeMethodsForList } from "./getEncodeMethodsForList";
import { getEncodeMethodsForMap } from "./getEncodeMethodsForMap";
import { getEncodeMethodsForOptional } from "./getEncodeMethodsForOptional";

export function writeContainers(tsMorph: TsMorph): tsMorph.WriterFunction {
    const printNode = createPrinter(tsMorph);
    const writer = FernWriters.object.writer({ newlinesBetweenProperties: true });

    for (const containerType of ContainerType._types()) {
        writer.addProperty({
            key: getEncoderNameForContainer(containerType),
            value: printNode(
                constructEncodeMethods({
                    methods: getEncodeMethodsForContainer({ containerType, ts: tsMorph.ts }),
                    ts: tsMorph.ts,
                })
            ),
        });
    }

    return writer.toFunction();
}

function getEncodeMethodsForContainer({
    containerType,
    ts,
}: {
    containerType: ContainerType["_type"];
    ts: TsMorph["ts"];
}): EncodeMethods {
    switch (containerType) {
        case "list":
        case "set": // Fern sets are just treated as lists in TS
            return getEncodeMethodsForList(ts);
        case "map":
            return getEncodeMethodsForMap(ts);
        case "optional":
            return getEncodeMethodsForOptional(ts);
        default:
            assertNever(containerType);
    }
}
