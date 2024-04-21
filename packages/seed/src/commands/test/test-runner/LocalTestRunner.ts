import { TestRunner } from "./TestRunner";

export class LocalTestRunner extends TestRunner {
    async build(): Promise<void> {
        return; // no need to build
    }

    async runGenerator({}: TestRunner.DoRunArgs): Promise<void> {}
}
