import { printTable } from "console-table-printer";

import { TestRunner } from "./test-runner";

export function printTestCases(result: TestRunner.TestResult[]): void {
    const items = result.map((r) => {
        return {
            Name: r.id,
            "Output Folder": !r.outputFolder ? " -- " : r.outputFolder,
            Result: r.type,
            "Generation Time": r.metrics.generationTime ?? "",
            "Build Time": r.metrics.buildTime ?? "",
            "Test Time": r.metrics.testTime ?? "",
            "Failure Type": r.type === "failure" ? r.cause : "",
            "Failure Message": r.type === "failure" ? r.message : ""
        };
    });
    printTable(items);
}
