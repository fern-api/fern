import { tsMorph, TsMorph } from "@fern-typescript/helper-utils";
import { BIN_SERDE_READER_VARIABLE_NAME, BIN_SERDE_WRITER_VARIABLE_NAME } from "../constructEncodeMethods";

type BinSerdeUtility = "reader" | "writer";

export function generateBinSerdeMethodCall({
    ts,
    utility,
    method,
    args,
}: {
    ts: TsMorph["ts"];
    utility: BinSerdeUtility;
    method: string;
    args?: readonly tsMorph.ts.Expression[];
}): tsMorph.ts.CallExpression {
    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(getBinSerdeVariableNameForUtility(utility)),
            ts.factory.createIdentifier(method)
        ),
        undefined,
        args
    );
}

function getBinSerdeVariableNameForUtility(utility: BinSerdeUtility): string {
    switch (utility) {
        case "reader":
            return BIN_SERDE_READER_VARIABLE_NAME;
        case "writer":
            return BIN_SERDE_WRITER_VARIABLE_NAME;
    }
}
