import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline";

import { FernToken, getUserToken } from "@fern-api/auth";
import { getDashboardBaseUrl } from "@fern-api/login";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";

interface AgentCommandOptions {
    /** The user's query (one-shot mode). Undefined triggers interactive REPL. */
    query: string | undefined;
    /** Organization name. Required — resolved from `fern.config.json` or `--org`. */
    organization: string;
    /** Resume an existing conversation by ID. */
    conversationId: string | undefined;
    /** Output raw JSON instead of rendered markdown. */
    json: boolean;
}

/**
 * Run the `fern agent` command.
 *
 * - One-shot: `fern agent "What's the traffic on docs.example.com?"`
 * - Interactive REPL: `fern agent` (no positional arg)
 * - Resume: `fern agent --conversation <uuid>`
 */
export async function agentCommand(context: TaskContext, options: AgentCommandOptions): Promise<void> {
    const token = await resolveToken(context);
    const dashboardUrl = getDashboardBaseUrl();
    const agentUrl = `${dashboardUrl}/api/agent`;
    const conversationId = options.conversationId ?? randomUUID();

    if (options.query != null) {
        // One-shot mode: send query, print response, exit.
        await sendAndPrint({
            context,
            agentUrl,
            token,
            orgName: options.organization,
            conversationId,
            message: options.query,
            json: options.json
        });
        return;
    }

    // Interactive REPL mode
    context.logger.info(chalk.cyan("Fern Agent") + chalk.dim(" — ask anything about your Fern docs sites."));
    context.logger.info(chalk.dim(`Conversation: ${conversationId}`));
    context.logger.info(chalk.dim("Type 'exit' or Ctrl+C to quit.\n"));

    await context.takeOverTerminal(async () => {
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: chalk.green("> ")
        });

        rl.prompt();

        for await (const line of rl) {
            const trimmed = line.trim();
            if (trimmed === "") {
                rl.prompt();
                continue;
            }
            if (trimmed.toLowerCase() === "exit" || trimmed.toLowerCase() === "quit") {
                break;
            }

            await sendAndPrint({
                context,
                agentUrl,
                token,
                orgName: options.organization,
                conversationId,
                message: trimmed,
                json: options.json
            });
            process.stdout.write("\n");
            rl.prompt();
        }

        rl.close();
    });
}

async function resolveToken(context: TaskContext): Promise<string> {
    // Try user token first (from `fern login`), then env FERN_TOKEN.
    const fernToken: FernToken | undefined = await getUserToken();
    if (fernToken != null) {
        return fernToken.value;
    }

    const envToken = process.env.FERN_TOKEN;
    if (envToken != null && envToken.trim().length > 0) {
        return envToken.trim();
    }

    context.failAndThrow(
        "Authentication required. Please run " +
            chalk.bold("fern login") +
            " or set the " +
            chalk.bold("FERN_TOKEN") +
            " environment variable."
    );
}

interface SendOptions {
    context: TaskContext;
    agentUrl: string;
    token: string;
    orgName: string;
    conversationId: string;
    message: string;
    json: boolean;
}

async function sendAndPrint(opts: SendOptions): Promise<void> {
    const { context, agentUrl, token, orgName, conversationId, message, json } = opts;

    const body = JSON.stringify({
        orgName,
        conversationId,
        message,
        source: "cli" as const
    });

    let response: Response;
    try {
        response = await fetch(agentUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body
        });
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        context.logger.error(`Request failed: ${errMsg}`);
        return;
    }

    if (!response.ok) {
        let detail: string;
        try {
            const errorBody = (await response.json()) as { error?: string };
            detail = errorBody.error ?? `HTTP ${response.status}`;
        } catch {
            detail = `HTTP ${response.status}`;
        }
        context.logger.error(`Agent error: ${detail}`);
        return;
    }

    if (json) {
        // In JSON mode, accumulate the full response and print as JSON.
        const text = await response.text();
        const output = JSON.stringify({ conversationId, response: text });
        process.stdout.write(output + "\n");
        return;
    }

    // Stream mode: print chunks as they arrive.
    if (response.body == null) {
        context.logger.error("Empty response from agent.");
        return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            process.stdout.write(decoder.decode(value, { stream: true }));
        }
        // Flush any remaining bytes
        const remaining = decoder.decode();
        if (remaining.length > 0) {
            process.stdout.write(remaining);
        }
        process.stdout.write("\n");
    } finally {
        reader.releaseLock();
    }
}
