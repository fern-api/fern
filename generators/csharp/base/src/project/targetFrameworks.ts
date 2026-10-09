/**
 * The target frameworks every generated SDK project builds against.
 */
export const TARGET_FRAMEWORKS = ["net462", "net8.0", "net9.0", "netstandard2.0"] as const;

const NET_FRAMEWORK_PATTERN = /^net(\d)(\d)(\d)?$/;
const NET_STANDARD_PATTERN = /^netstandard(\d+)\.(\d+)$/;
const NET_CORE_PATTERN = /^net(\d+)\.(\d+)$/;

/**
 * Renders the target frameworks as human-readable prerequisites for the README's
 * requirements section, e.g. `net8.0` -> ".NET 8 and above".
 *
 * Consecutive modern .NET versions collapse into their lowest entry, since
 * ".NET 8 and above" already covers `net9.0`.
 */
export function getTargetFrameworkRequirements(targetFrameworks: readonly string[] = TARGET_FRAMEWORKS): string[] {
    const requirements: string[] = [];
    let lowestNetCoreMajor: number | undefined;

    for (const targetFramework of targetFrameworks) {
        const netCore = NET_CORE_PATTERN.exec(targetFramework);
        if (netCore?.[1] != null) {
            const major = Number.parseInt(netCore[1], 10);
            if (lowestNetCoreMajor == null || major < lowestNetCoreMajor) {
                lowestNetCoreMajor = major;
            }
            continue;
        }

        const netStandard = NET_STANDARD_PATTERN.exec(targetFramework);
        if (netStandard?.[1] != null && netStandard[2] != null) {
            requirements.push(`.NET Standard ${netStandard[1]}.${netStandard[2]} and above`);
            continue;
        }

        const netFramework = NET_FRAMEWORK_PATTERN.exec(targetFramework);
        if (netFramework?.[1] != null && netFramework[2] != null) {
            const version = [netFramework[1], netFramework[2], netFramework[3]]
                .filter((part) => part != null)
                .join(".");
            requirements.push(`.NET Framework ${version} and above`);
        }
    }

    if (lowestNetCoreMajor != null) {
        requirements.unshift(`.NET ${lowestNetCoreMajor} and above`);
    }
    return requirements;
}
