import { runEteTest } from "./runEteTest";

export function itFernETE(testName: string, args: runEteTest.Args): void {
    it(testName, () => runEteTest(args), 120_000);
}
