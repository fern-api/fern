import { runEteTest } from "./runEteTest";

export function itFernETE(args: runEteTest.Args, { only = false }: { only?: boolean } = {}): void {
    (only ? it.only : it)(args.testName, () => runEteTest(args), 120_000);
}
