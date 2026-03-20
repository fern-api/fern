import { getTextOfTsNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";

/**
 * Serializes an array of ts.Statement nodes to a string by concatenating their text.
 * Used across 10+ test files for snapshot testing of generated code statements.
 */
export function serializeStatements(statements: ts.Statement[]): string {
    return statements.map((s) => getTextOfTsNode(s)).join("\n");
}
