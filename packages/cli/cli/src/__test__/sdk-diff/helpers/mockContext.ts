import { CliContext } from "../../../cli-context/CliContext";

/**
 * Mock CLI context for SDK diff testing.
 * Extends the existing MockCliContext pattern but customized for SDK diff tests.
 */
export class MockSdkDiffCliContext extends CliContext {
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

    // Override failWithoutThrowing to capture errors for testing
    public capturedErrors: string[] = [];

    failWithoutThrowing(message: string): void {
        this.capturedErrors.push(message);
        // Don't call super.failWithoutThrowing as it might exit
    }
}
