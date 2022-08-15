import { runEteTest } from "./runEteTest";

export function itFernETE(testName: string, args: runEteTest.Args, { only = false }: { only?: boolean } = {}): void {
    (only ? it.only : it)(testName, () => runEteTest(args), 120_000);
}
