/**
 * Global flag that enables or disables stack tracing functionality throughout the application.
 * This is controlled via the FERN_STACK_TRACK environment variable.
 *
 * When enabled (truthy environment variable value), stack traces will be captured and processed
 * by the stacktrace functions in this module. When disabled, the stacktrace() function returns
 * an empty array for performance optimization.
 *
 * @example
 * // Enable tracing by setting the environment variable
 * // FERN_STACK_TRACK=1 <cmdline>
 */
const key = process.env["FERN_STACK_TRACK"]?.toLowerCase() ?? "";

export const enableStackTracking = key !== "" && key !== "0" && key !== "false";

/** The style of comments desired for the stack tracking comments
 *
 * can be "single", "multiline", or "box".
 * if not set to one of those, defaults to "single".
 */
export const trackingType = ["single", "multiline", "box"].includes(key) ? key : "single";

if (enableStackTracking) {
    // we're going to put a hard max limit on the stack trace to prevent infinite recursion and excessive stack generation
    Error.stackTraceLimit = 50;
}

/**
 * Configuration options for controlling stack trace capture and filtering behavior.
 */
interface StackTraceOptions {
    /**
     * Maximum number of stack frames to return after filtering.
     *
     * Maximum may never exceed 50.
     * @default 50
     */
    maxFrames?: number;

    /**
     * Number of frames to skip from the beginning of the filtered stack trace.
     * Useful for omitting wrapper functions from the output.
     * @default 0
     */
    skip?: number;

    /**
     * Array of function name substrings that trigger an early stop when encountered.
     * When a frame's function name includes any of these strings, that frame and all
     * subsequent frames will be excluded from the output.
     *
     * implicitly includes "runInteractiveTask"
     * @default []
     */
    stopOn?: string[];

    /**
     * Array of file path substrings to filter out. Any frame whose path contains
     * any of these strings will be excluded from the output.
     * @default []
     */
    filterPaths?: string[];

    /**
     * Array of function name substrings to filter out. Any frame whose function name
     * contains any of these strings will be excluded from the output.
     *
     * implicitly includes "SdkGeneratorCLI", "runCli","Frames.trace","Frames.tag", "at", "stacktrace"
     * @default []
     */
    filterFunctions?: string[];

    /**
     * Whether to filter out Node.js internal frames (paths starting with "node:").
     * @default true
     */
    filterNode?: boolean;

    /**
     * Whether to filter out .js files, which typically indicate non-source files
     * without source map information.
     * @default true
     */
    filterJs?: boolean;

    /**
     * A function to format the file path of the stack trace frame.
     * @default (filename) => filename
     */
    formatFilename?: (filename: string) => string;
}

/**
 * Represents a single parsed stack trace frame containing function, file path, and position information.
 */
export interface StackTraceFrame {
    /**
     * The function name or context. May include special formatting like "alias()=> { ... }"
     * for certain Object methods, or be an empty string for anonymous contexts.
     */
    fn: string;

    /**
     * The file path where this frame originated. This will typically be the full path
     * to the source file.
     */
    path: string;

    /**
     * The line and column position in the format "line:column" (e.g., "42:13").
     */
    position: string;
}

/**
 * Captures and parses the current call stack, returning an array of stack frames with filtering options.
 *
 * This function creates a new Error object to capture the stack trace, then parses each frame
 * to extract function names, file paths, and positions. It applies multiple filtering strategies
 * to exclude unwanted frames (e.g., Node.js internals, .js files, specific functions).
 *
 * The function only operates when `enableStackTracking` is true. If tracing is disabled, it returns
 * an empty array for performance optimization.
 *
 * @param options - Configuration options for stack trace capture and filtering
 * @returns Array of parsed stack trace frames, filtered and limited according to the options
 *
 * @example
 * // Capture the first 10 frames, skipping the first 2
 * const frames = stacktrace({ maxFrames: 10, skip: 2 });
 *
 * @example
 * // Capture frames until hitting "main" function, filter out test files
 * const frames = stacktrace({
 *   stopOn: ["main"],
 *   filterPaths: ["/test/"],
 *   filterFunctions: ["runTests"]
 * });
 *
 * @remarks
 * The function applies filters in the following order:
 * 1. Parses each stack frame using regex to extract function, path, line, and column
 * 2. Applies early-stop logic when encountering functions in the `stopOn` array
 * 3. Formats special function names (e.g., "Object.alias" → "alias()=> { ... }")
 * 4. Filters out:
 *    - The stacktrace function itself ("at", "stacktrace")
 *    - Functions matching `filterFunctions` (substring match)
 *    - Node.js internal frames (if `filterNode` is true)
 *    - .js files (if `filterJs` is true)
 *    - Paths matching `filterPaths` (substring match)
 * 5. Applies `skip` and `maxFrames` to limit the output
 */
export function stacktrace({
    maxFrames = 50,
    skip = 0,
    filterPaths = [],
    filterFunctions = [],
    stopOn = [],
    filterNode = true,
    filterJs = true,
    formatFilename = (filename) => filename
}: StackTraceOptions = {}): StackTraceFrame[] {
    if (!enableStackTracking) {
        return [];
    }
    filterFunctions = [
        ...filterFunctions,
        "SdkGeneratorCLI",
        "runCli",
        "Frames.trace",
        "Frames.tag",
        "at",
        "stacktrace",
        "LoggerImpl",
        "Array.forEach",
        "tag"
    ];
    stopOn = [...stopOn, "runInteractiveTask"];
    let stop = false;
    return (
        (new Error().stack ?? "")
            .split("\n")
            .map((line) => {
                const match = line.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/);
                if (match && match.length === 5) {
                    let [, fn, path, line, column] = match;
                    if (!fn || !path || !line || !column) {
                        return undefined;
                    }

                    if (stop || stopOn.some((s) => fn?.includes(s))) {
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
                    return { fn, path, position: `${line}:${column}` } as StackTraceFrame;
                }
                return undefined;
            })
            .filter(
                (each) =>
                    each &&
                    !["at", "stacktrace", "Frames.trace", "Frames.tag"].includes(each.fn) && // don't return the stack trace function itself
                    !filterFunctions.some((f) => each.fn.includes(f)) && // substring match for filter functions
                    !(filterNode && each.path?.startsWith("node:")) && // starts with node:
                    !(filterJs && each.path?.endsWith(".js")) && // ends with .js (meaning likely not a source file - no source map info)
                    !filterPaths.some((p) => each.path.includes(p)) // substring match for filter paths
            ) as StackTraceFrame[]
    ).slice(skip, skip + maxFrames);
}

/**
 * Returns a formatted stack trace string at the current location for debugging purposes.
 *
 * This is a convenience function that wraps `stacktrace()` and formats the output as a
 * human-readable string. It's particularly useful for logging or debugging to understand
 * the execution flow and call hierarchy.
 *
 * The function supports both single-line and multi-line output formats. Single-line format
 * concatenates all frames into one line (useful for compact logging), while multi-line format
 * adds newlines and indentation for better readability.
 *
 * @param options - Configuration options for stack trace capture, filtering, and formatting
 * @param options.multiline - Whether to format the output with newlines and indentation.
 *                            When true, each frame is on its own line with 4-space indent.
 *                            When false (default), all frames are concatenated on one line.
 * @returns A formatted string containing the stack trace information, prefixed with "stacktrace - "
 *
 * @example
 * // Single-line format (compact)
 * console.log(at());
 * // Output: "stacktrace - myFunction - /path/to/file.ts:42:13anotherFunc - /path/to/other.ts:17:5"
 *
 * @example
 * // Multi-line format (readable)
 * console.log(at({ multiline: true, maxFrames: 5 }));
 * // Output:
 * // stacktrace -
 * //     myFunction - /path/to/file.ts:42:13
 * //     anotherFunc - /path/to/other.ts:17:5
 * //     main - /path/to/index.ts:10:1
 *
 * @example
 * // Custom filtering for specific use case
 * console.log(at({
 *   maxFrames: 10,
 *   skip: 1,
 *   filterPaths: ["foo.ts"],
 *   multiline: true
 * }));
 *
 * @remarks
 * This function automatically skips itself from the stack trace output by default.
 * The "at" function name is filtered by the underlying `stacktrace()` function.
 */
export function at({
    maxFrames = 50,
    skip = 0,
    filterPaths = [],
    filterFunctions = [],
    stopOn = ["runInteractiveTask"],
    filterNode = true,
    filterJs = true,
    multiline = false,
    formatFilename = (filename) => filename
}: StackTraceOptions & { multiline?: boolean } = {}): string {
    return enableStackTracking
        ? `${stacktrace({ maxFrames, skip, filterPaths, filterFunctions, stopOn, filterNode, filterJs })
              .map((each) => `${multiline ? "\n    " : " > "}${each.fn} - ${each.path}:${each.position}`)
              .join("")}`
        : "";
}

/** This class allows the developer to attach stack trace information to objects  */
export class StackTraces {
    private readonly maxFrames: number;
    private readonly skip: number;
    private readonly filterPaths: string[];
    private readonly filterFunctions: string[];
    private readonly stopOn: string[];
    private readonly filterNode: boolean;
    private readonly filterJs: boolean;
    private readonly multiline: boolean;
    private readonly formatFilename: (filename: string) => string;
    private tracking = new WeakMap<object, Set<StackTraceFrame>>();

    constructor({
        maxFrames = 50,
        skip = 0,
        filterPaths = [],
        filterFunctions = [],
        stopOn = [],
        filterNode = true,
        filterJs = true,
        multiline = false,
        formatFilename = (filename) => filename
    }: StackTraceOptions & { multiline?: boolean } = {}) {
        this.maxFrames = maxFrames;
        this.skip = skip;
        this.filterPaths = filterPaths;
        this.filterFunctions = filterFunctions;
        this.stopOn = stopOn;
        this.filterNode = filterNode;
        this.filterJs = filterJs;
        this.multiline = multiline;
        this.formatFilename = formatFilename;
    }

    /**
     * Tags the current stack trace with the given object.
     *
     * This can be called multiple times to add more stack trace information to the object.
     *
     * @param obj - The object to tag the stack trace with.
     */
    tag(obj: object): void {
        const current = this.tracking.get(obj) || new Set<StackTraceFrame>();
        stacktrace({
            maxFrames: this.maxFrames,
            skip: this.skip,
            filterPaths: this.filterPaths,
            filterFunctions: this.filterFunctions,
            stopOn: this.stopOn,
            filterNode: this.filterNode,
            filterJs: this.filterJs
        }).forEach((frame) => current.add(frame));
        this.tracking.set(obj, current);
    }

    /**
     * Returns a formatted stack trace string for the given object.
     * @param obj - The object to get the stack trace for.
     * @returns A formatted string containing the stack trace information.
     */
    trace(obj: object): string {
        if (!enableStackTracking) {
            return "";
        }
        const frames = this.tracking.get(obj);
        if (!frames) {
            return "";
        }

        return [...frames]
            .map((each) => `${this.multiline ? "\n    " : ""}${each.fn} - ${each.path}:${each.position}`)
            .join("");
    }

    /**
     * Gets the stack trace frames for the given object.
     *
     * Note: This will only work when FERN_STACK_TRACK is defined and the .startTracking() function has been called.
     *       Otherwise this will return an empty array.
     *
     * @param obj - The object to get the stack trace frames for.
     * @returns The stack trace frames for the given object.
     */
    frames(obj: object): StackTraceFrame[] {
        const frames = this.tracking.get(obj);
        if (!frames) {
            return [];
        }
        return [...frames];
    }

    /**
     * Frees the stack trace information for the given object.
     * @param obj - The object to free the stack trace information for.
     */
    free(obj: object): void {
        this.tracking.delete(obj);
    }

    /**
     * Clears all stack trace information.
     */
    clear(): void {
        this.tracking = new WeakMap<object, Set<StackTraceFrame>>();
    }
}

let stackTraces: StackTraces | undefined;
/**
 * Starts tracking the stack trace of the current object.
 *
 * Note: This will only start tracking when FERN_STACK_TRACK is defined.
 *
 * @param options - Configuration options for stack trace capture and filtering
 * @returns The stack traces object.
 */
export function startTracking({
    maxFrames = 50,
    skip = 0,
    filterPaths = [],
    filterFunctions = [],
    stopOn = [],
    filterNode = true,
    filterJs = true,
    multiline = false,
    formatFilename = (filename) => filename
}: StackTraceOptions & { multiline?: boolean } = {}) {
    if (!enableStackTracking) {
        return;
    }
    stackTraces ??= new StackTraces({
        maxFrames,
        skip,
        filterPaths,
        filterFunctions,
        stopOn,
        filterNode,
        filterJs,
        multiline,
        formatFilename
    });
}

/**
 * Tags the current stack trace with the given object.
 *
 * Note: This will only work when FERN_STACK_TRACK is defined and the .startTracking() function has been called.
 *       Otherwise this will do nothing whatsoever.
 *
 * @param obj - The object to tag the stack trace with.
 */
export function tag(obj: object) {
    stackTraces?.tag(obj);
}

/**
 * Returns a formatted stack trace string for the given object.
 *
 * Note: This will only work when FERN_STACK_TRACK is defined and the .startTracking() function has been called.
 *       Otherwise this will do nothing whatsoever.
 *
 * @param obj - The object to get the stack trace for.
 * @returns A formatted string containing the stack trace information.
 */
export function trace(obj: object) {
    return stackTraces?.trace(obj) ?? "";
}

/**
 * Frees the stack trace information for the given object.
 *
 * Note: This will only work when FERN_STACK_TRACK is defined and the .startTracking() function has been called.
 *       Otherwise this will do nothing whatsoever.
 *
 * @param obj - The object to free the stack trace information for.
 */
export function free(obj: object) {
    stackTraces?.free(obj);
}

/**
 * Gets the stack trace frames for the given object.
 *
 * Note: This will only work when FERN_STACK_TRACK is defined and the .startTracking() function has been called.
 *       Otherwise this will return an empty array.
 *
 * @param obj - The object to get the stack trace frames for.
 * @returns The stack trace frames for the given object.
 */
export function frames(obj: object): StackTraceFrame[] {
    return stackTraces?.frames(obj) ?? [];
}
