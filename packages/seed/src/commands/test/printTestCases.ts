import { printTable } from "console-table-printer";
import { TestRunner } from "./test-runner";

export function printTestCases(result: TestRunner.TestResult[]): void {
    const items = result.map((r) => {
        return {
            Name: r.id,
            Result: r.type,
            "Generation Time": r.metrics.generationTime,
            "Compile Time": r.metrics.compileTime,
            "Failure Type": r.type === "failure" ? r.cause : "",
            "Failure Message": r.type === "failure" ? r.message : ""
        };
    });
    printTable(items);
}
