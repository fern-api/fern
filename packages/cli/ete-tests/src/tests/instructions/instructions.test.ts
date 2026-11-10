import { InstructionsTopic } from "@fern-api/task-context";
import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli.js";

// Runs against the live docs at buildwithfern.com/learn/home/fern-instructions, so it also catches
// instruction pages that move without a redirect and changes to the docs site's Markdown preamble.

const TOPIC_CONCURRENCY = 6;

let cwd: tmp.DirectoryResult | undefined;

beforeAll(async () => {
    cwd = await tmp.dir({ unsafeCleanup: true });
});

afterAll(async () => {
    await cwd?.cleanup();
});

async function runInstructions(
    topic: string[],
    signal: AbortSignal
): Promise<{ exitCode: number | undefined; stdout: string; stderr: string }> {
    const { exitCode, stdout, stderr } = await runFernCli(["instructions", ...topic], {
        cwd: cwd?.path,
        includeAuthToken: false,
        reject: false,
        signal
    });
    return { exitCode, stdout: String(stdout), stderr: String(stderr) };
}

/**
 * Reads topics from the index tables (`| \`docs publish\` | When to use |`). A placeholder row like
 * `sdks <language>` expands to each backticked value in its "When to use" cell.
 */
function parseTopicsFromIndex(index: string): string[][] {
    const topics: string[][] = [];
    for (const line of index.split("\n")) {
        const match = /^\|\s*`([^`]+)`\s*\|(.*)\|\s*$/.exec(line);
        const topic = match?.[1];
        if (topic == null) {
            continue;
        }
        const words = topic.split(/\s+/);
        const placeholderIndex = words.findIndex((word) => /^<.+>$/.test(word));
        if (placeholderIndex === -1) {
            topics.push(words);
            continue;
        }
        for (const value of match?.[2]?.matchAll(/`([^`]+)`/g) ?? []) {
            if (value[1] != null) {
                topics.push(words.map((word, i) => (i === placeholderIndex ? value[1] : word)).filter(isString));
            }
        }
    }
    return topics;
}

function isString(value: string | undefined): value is string {
    return value != null;
}

/** Returns why the output isn't a clean instructions page, or undefined if it is. */
function describeProblem({
    exitCode,
    stdout,
    stderr
}: Awaited<ReturnType<typeof runInstructions>>): string | undefined {
    if (exitCode !== 0) {
        return `exited ${exitCode}: ${stderr.trim()}`;
    }
    if (!stdout.startsWith("# ")) {
        return `doesn't start with an H1: ${stdout.slice(0, 80)}`;
    }
    if (stdout.includes("For clean Markdown") || stdout.includes("This page is for")) {
        return "still contains the docs site's agent preamble";
    }
    return undefined;
}

describe("fern instructions", () => {
    it("prints the remote index and every topic it lists", async ({ signal }) => {
        const index = await runInstructions([], signal);
        expect(describeProblem(index)).toBeUndefined();

        const topics = parseTopicsFromIndex(index.stdout);
        // `overview` is the index's documented starting point; other topic names can change freely.
        expect(topics.map((topic) => topic.join(" "))).toContain("overview");

        const failures: string[] = [];
        const queue = [...topics];
        await Promise.all(
            Array.from({ length: TOPIC_CONCURRENCY }, async () => {
                for (let topic = queue.shift(); topic != null; topic = queue.shift()) {
                    const problem = describeProblem(await runInstructions(topic, signal));
                    if (problem != null) {
                        failures.push(`${topic.join(" ")}: ${problem}`);
                    }
                }
            })
        );
        expect(failures).toEqual([]);
    }, 300_000);

    it("resolves every topic that CLI errors point to", async ({ signal }) => {
        const failures: string[] = [];
        for (const topic of Object.values(InstructionsTopic)) {
            const problem = describeProblem(await runInstructions(topic.split(" "), signal));
            if (problem != null) {
                failures.push(`"${topic}": ${problem}`);
            }
        }
        expect(failures).toEqual([]);
    }, 120_000);

    it("prints the same index for `fern instructions index`", async ({ signal }) => {
        const [bare, index] = await Promise.all([runInstructions([], signal), runInstructions(["index"], signal)]);
        expect(describeProblem(index)).toBeUndefined();
        expect(index.stdout).toBe(bare.stdout);
    }, 60_000);

    it("fails with a pointer to the topic list for an unknown topic", async ({ signal }) => {
        const { exitCode, stdout, stderr } = await runInstructions(["not-a-real-topic"], signal);
        expect(exitCode).not.toBe(0);
        // The CLI logs errors to stdout when it isn't attached to a TTY.
        expect(`${stdout}${stderr}`).toContain(
            'No instructions found for "not-a-real-topic". Run `fern instructions` to list topics.'
        );
        expect(stdout).not.toContain("# ");
    }, 60_000);
});
