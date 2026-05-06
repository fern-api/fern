import { schemas } from "@fern-api/config";
import { AiCredentialStore } from "../../auth/AiCredentialStore.js";

type FernRcAiProvider = schemas.FernRcAiProvider;
type FernRcAiSchema = schemas.FernRcAiSchema;

/**
 * Single-shot completion client. Implementations talk to a specific provider
 * (Anthropic Messages API, OpenAI Chat Completions, AWS Bedrock Runtime) and
 * return the model's text response. Errors propagate as thrown `Error`s so the
 * caller can format them.
 */
export interface AiProviderClient {
    /** Provider name shown in user-facing summaries. */
    readonly name: FernRcAiProvider;
    /** Model identifier used for this client. */
    readonly model: string;
    /** Issue a single-shot prompt and return the assistant's text response. */
    complete(prompt: string): Promise<string>;
}

export type AiProviderResolution =
    | { ok: true; provider: FernRcAiProvider; client: AiProviderClient }
    | { ok: false; reason: string };

/**
 * Pick a provider based on the user's `~/.fernrc` `ai:` section, falling back
 * to environment variables for keys. The `provider` field defaults to
 * `anthropic` when unset for backwards compatibility.
 */
export async function resolveAiProvider({
    aiConfig
}: {
    aiConfig: FernRcAiSchema | undefined;
}): Promise<AiProviderResolution> {
    const provider: FernRcAiProvider = aiConfig?.provider ?? "anthropic";
    const credentialStore = new AiCredentialStore();

    switch (provider) {
        case "anthropic": {
            // Priority: env var → OS keyring
            const key = process.env["ANTHROPIC_API_KEY"] ?? (await credentialStore.getKey("anthropic"));
            if (key == null || key === "") {
                return { ok: false, reason: missingKeyMessage("anthropic", "ANTHROPIC_API_KEY") };
            }
            return { ok: true, provider, client: new AnthropicClient(key) };
        }
        case "openai": {
            // Priority: env var → OS keyring
            const key = process.env["OPENAI_API_KEY"] ?? (await credentialStore.getKey("openai"));
            if (key == null || key === "") {
                return { ok: false, reason: missingKeyMessage("openai", "OPENAI_API_KEY") };
            }
            return { ok: true, provider, client: new OpenAiClient(key) };
        }
        case "bedrock":
            return { ok: true, provider, client: new BedrockClient() };
    }
}

function missingKeyMessage(provider: FernRcAiProvider, envVar: string): string {
    return (
        `No API key found for provider \`${provider}\`. Set one with:\n` +
        `  fern config ai set-key <key>\n` +
        `  or export ${envVar}=<key>`
    );
}

// ---------------------------------------------------------------------------
// Anthropic
// ---------------------------------------------------------------------------

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

class AnthropicClient implements AiProviderClient {
    public readonly name = "anthropic" as const;
    public readonly model = ANTHROPIC_MODEL;

    public constructor(private readonly apiKey: string) {}

    public async complete(prompt: string): Promise<string> {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": this.apiKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            body: JSON.stringify({
                model: ANTHROPIC_MODEL,
                max_tokens: 4096,
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Anthropic API error ${response.status}: ${body}`);
        }

        const json = (await response.json()) as { content: Array<{ type: string; text: string }> };
        const text = json.content.find((block) => block.type === "text")?.text;
        if (text == null) {
            throw new Error("Anthropic API returned no text content");
        }
        return text;
    }
}

// ---------------------------------------------------------------------------
// OpenAI
// ---------------------------------------------------------------------------

const OPENAI_MODEL = "gpt-4o-mini";

class OpenAiClient implements AiProviderClient {
    public readonly name = "openai" as const;
    public readonly model = OPENAI_MODEL;

    public constructor(private readonly apiKey: string) {}

    public async complete(prompt: string): Promise<string> {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                authorization: `Bearer ${this.apiKey}`,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                model: OPENAI_MODEL,
                max_tokens: 4096,
                temperature: 0,
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`OpenAI API error ${response.status}: ${body}`);
        }

        const json = (await response.json()) as {
            choices: Array<{ message: { content: string | null } }>;
        };
        const text = json.choices[0]?.message?.content;
        if (text == null || text === "") {
            throw new Error("OpenAI API returned no text content");
        }
        return text;
    }
}

// ---------------------------------------------------------------------------
// Bedrock
// ---------------------------------------------------------------------------

// Anthropic Claude on Bedrock — keep parity with the direct Anthropic provider.
const BEDROCK_MODEL = "anthropic.claude-3-5-haiku-20241022-v1:0";

class BedrockClient implements AiProviderClient {
    public readonly name = "bedrock" as const;
    public readonly model = BEDROCK_MODEL;

    public async complete(prompt: string): Promise<string> {
        // Lazy-load the AWS SDK so it isn't a hard dependency for users who
        // never select the bedrock provider. The dynamic-import expression is
        // typed as `unknown` because the SDK is intentionally not in our
        // package.json — users who opt into Bedrock install it themselves.
        const mod = await loadBedrockSdk();

        const client = new mod.BedrockRuntimeClient({
            region: process.env["AWS_REGION"] ?? process.env["AWS_DEFAULT_REGION"] ?? "us-east-1"
        });

        const body = JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }]
        });

        const result = (await client.send(
            new mod.InvokeModelCommand({
                modelId: BEDROCK_MODEL,
                contentType: "application/json",
                accept: "application/json",
                body
            })
        )) as { body?: Uint8Array };

        const responseBody = result.body == null ? "" : new TextDecoder().decode(result.body);
        if (responseBody === "") {
            throw new Error("Bedrock returned empty response body");
        }

        const parsed = JSON.parse(responseBody) as { content?: Array<{ type: string; text: string }> };
        const text = parsed.content?.find((block) => block.type === "text")?.text;
        if (text == null) {
            throw new Error("Bedrock returned no text content");
        }
        return text;
    }
}

interface BedrockSdkModule {
    BedrockRuntimeClient: new (config: { region?: string }) => { send(cmd: unknown): Promise<unknown> };
    InvokeModelCommand: new (input: { modelId: string; contentType: string; accept: string; body: string }) => unknown;
}

async function loadBedrockSdk(): Promise<BedrockSdkModule> {
    try {
        // The package isn't a declared dependency — opt-in install only.
        // We cast through `unknown` so TypeScript doesn't try to resolve
        // typings we don't have.
        const sdkName = "@aws-sdk/client-bedrock-runtime";
        const loaded = (await import(/* @vite-ignore */ /* webpackIgnore: true */ sdkName)) as unknown;
        return loaded as BedrockSdkModule;
    } catch {
        throw new Error(
            "Bedrock provider requires the @aws-sdk/client-bedrock-runtime package.\n" +
                "  Install it with: npm install -g @aws-sdk/client-bedrock-runtime\n" +
                "  (or switch providers: fern config ai set-provider anthropic)"
        );
    }
}
