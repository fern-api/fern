export interface CliEnvironment {
    packageName: string;
    packageVersion: string;
    cliName: string;
}

export function readCliEnvironment(): CliEnvironment {
    if (process.env.CLI_PACKAGE_NAME == null) {
        throw new Error("CLI_PACKAGE_NAME is not defined");
    }
    if (process.env.CLI_VERSION == null) {
        throw new Error("CLI_VERSION is not defined");
    }
    if (process.env.CLI_NAME == null) {
        throw new Error("CLI_NAME is not defined");
    }
    return {
        packageName: process.env.CLI_PACKAGE_NAME,
        packageVersion: process.env.CLI_VERSION,
        cliName: process.env.CLI_NAME,
    };
}
