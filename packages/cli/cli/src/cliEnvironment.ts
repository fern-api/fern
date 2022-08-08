export interface RawCliEnvironment {
    packageName: string | undefined;
    packageVersion: string | undefined;
    cliName: string | undefined;
}

export interface ParsedCliEnvironment {
    packageName: string;
    packageVersion: string;
    cliName: string;
}

export function readRawCliEnvironment(): RawCliEnvironment {
    return {
        packageName: process.env.PACKAGE_NAME,
        packageVersion: process.env.PACKAGE_VERSION,
        cliName: process.env.CLI_NAME,
    };
}

export function parseRawCliEnvironmentOrThrow(raw: RawCliEnvironment, failureMsg: string): ParsedCliEnvironment {
    if (raw.cliName == null) {
        throw new Error(`${failureMsg}. CLI_NAME was not found`);
    } else if (raw.packageName == null) {
        throw new Error(`${failureMsg}. PACKAGE_NAME was not found`);
    } else if (raw.packageVersion == null) {
        throw new Error(`${failureMsg}. PACKAGE_VERSION was not found`);
    }
    return {
        cliName: raw.cliName,
        packageName: raw.packageName,
        packageVersion: raw.packageVersion,
    };
}

export function tryParseRawCliEnvironment(raw: RawCliEnvironment): ParsedCliEnvironment | undefined {
    if (raw.cliName == null || raw.packageName == null || raw.packageVersion == null) {
        return undefined;
    }
    return {
        cliName: raw.cliName,
        packageName: raw.packageName,
        packageVersion: raw.packageVersion,
    };
}
