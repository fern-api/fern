Error.stackTraceLimit = 50;

/**
 * This function is used to get the stack trace of the current code execution point.$
 * It cleans up the stack trace to remove unnecessary frames and return a list of frames.
 * (Used for debugging purposes)
 *
 * @returns A list of frames with the function name, path, and position.
 */
export function stacktrace(maxFrames: number = 50): { fn: string; path: string; position: string }[] {
    let stop = false;
    return (
        (new Error().stack ?? "")
            .split("\n")
            .map((line) => {
                const match = line.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/);
                if (match && match.length === 5) {
                    let [, fn, path, line, column] = match;
                    if (stop || fn?.includes("runInteractiveTask")) {
                        stop = true;
                        return undefined;
                    }
                    switch (fn) {
                        case "Object.<anonymous>":
                            fn = "";
                            break;
                        case "Object.object":
                        case "Object.alias":
                        case "Object.union":
                        case "Object.enum":
                        case "Object.undiscriminatedUnion":
                            fn = `${fn.substring(fn.indexOf(".") + 1)}()=> { ... }`;
                            break;
                    }
                    return { fn, path, position: `${line}:${column}` };
                }
                return undefined;
            })
            .filter(
                (each) =>
                    each &&
                    "stacktrace" !== each.fn &&
                    !each.path?.startsWith("node:") &&
                    !each.path?.endsWith(".js") &&
                    each.fn !== "Object.classReference" &&
                    !each.fn?.includes("SdkGeneratorCLI") &&
                    !each.fn?.includes("runCli")
            ) as {
            fn: string;
            path: string;
            position: string;
        }[]
    ).slice(0, maxFrames);
}

export function stack(maxFrames: number = 50): string {
    return (
        "\n" +
        stacktrace(maxFrames)
            .slice(1, maxFrames)
            .map((each) => `${each.fn} - ${each.path}:${each.position}`)
            .join("\n")
    );
}
