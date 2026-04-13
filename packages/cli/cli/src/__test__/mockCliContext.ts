import { CliContext } from "../cli-context/CliContext.js";

export async function createMockCliContext(): Promise<CliContext> {
    process.env.CLI_PACKAGE_NAME = "test-package";
    process.env.CLI_VERSION = "0.0.0";
    process.env.CLI_NAME = "test-cli";

    return CliContext.create(process.stdout, process.stderr, { isLocal: true });
}
