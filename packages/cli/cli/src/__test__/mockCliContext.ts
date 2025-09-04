import { CliContext } from "../cli-context/CliContext";

// Create a test-specific context that doesn't exit
export class MockCliContext extends CliContext {
    constructor() {
        // Set required environment variables to prevent constructor from calling exitProgram
        process.env.CLI_PACKAGE_NAME = "test-package";
        process.env.CLI_VERSION = "0.0.0";
        process.env.CLI_NAME = "test-cli";

        super(process.stdout, process.stderr, { isLocal: true });
    }

    // Override exit to prevent process.exit in tests
    async exit({ code }: { code?: number } = {}): Promise<never> {
        throw new Error(`CliContext.exit called with code: ${code}`);
    }
}
