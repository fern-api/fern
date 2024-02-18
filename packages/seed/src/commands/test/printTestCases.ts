import { printTable } from "console-table-printer";
import { TestResult } from "./testWorkspaceFixtures";

export function printTestCases(result: TestResult[]): void {
    const items = result.map((r) => {
        return {
            Name: r.id,
            Result: r.type,
            "Generation Time": r.metrics.generationTime,
            "Verification Time": r.metrics.verificationTime,
            "Failure Type": r.type === "failure" ? r.cause : undefined,
            "Failure Message": r.type === "failure" ? r.message : undefined
        };
    });
    printTable(items);
}
