#!/usr/bin/env bash
#
# Injects a stricter SSE deserialization test into the ts-sdk server-sent-event-examples
# fixture and runs it. The injected test file is removed after the run (pass or fail).
#
# Usage: ./scripts/test-sse-deserialization.sh
#
set -euo pipefail

FIXTURE_DIR="seed/ts-sdk/server-sent-event-examples"
TEST_FILE="$FIXTURE_DIR/tests/wire/sse-deserialization.test.ts"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

cat > "$TEST_FILE" << 'TESTEOF'
import * as SeedServerSentEvents from "../../src/api/index";
import { SeedServerSentEventsClient } from "../../src/Client";
import { mockServerPool } from "../mock-server/MockServerPool";

describe("SSE deserialization — discriminator edge cases", () => {
    // ─── stream (no discriminator, StreamedCompletion) ──────────────────

    test("stream: optional tokens omitted", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedServerSentEventsClient({ maxRetries: 0, environment: server.baseUrl });
        const rawResponseBody = 'event: completion\ndata: {"delta":"partial"}\n\n';

        server
            .mockEndpoint()
            .post("/stream")
            .jsonBody({ query: "no-tokens" })
            .respondWith()
            .statusCode(200)
            .sseBody(rawResponseBody)
            .build();

        const response = await client.completions.stream({ query: "no-tokens" });
        const events: unknown[] = [];
        for await (const event of response) {
            events.push(event);
        }
        expect(events).toEqual([{ delta: "partial" }]);
    });

    // ─── streamEvents (discriminator IN data JSON) ──────────────────────

    test("streamEvents: error variant with optional code present", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedServerSentEventsClient({ maxRetries: 0, environment: server.baseUrl });
        const rawResponseBody =
            'event: completion\ndata: {"event":"completion","content":"hello"}\n\nevent: error\ndata: {"event":"error","error":"oops","code":500}\n\n';

        server
            .mockEndpoint()
            .post("/stream-events")
            .jsonBody({ query: "mixed" })
            .respondWith()
            .statusCode(200)
            .sseBody(rawResponseBody)
            .build();

        const response = await client.completions.streamEvents({ query: "mixed" });
        const events: unknown[] = [];
        for await (const event of response) {
            events.push(event);
        }
        expect(events).toEqual([
            { event: "completion", content: "hello" },
            { event: "error", error: "oops", code: 500 },
        ]);
    });

    test("streamEvents: envelope disagrees with data discriminator — data JSON wins", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedServerSentEventsClient({ maxRetries: 0, environment: server.baseUrl });
        const rawResponseBody = 'event: error\ndata: {"event":"completion","content":"sneaky"}\n\n';

        server
            .mockEndpoint()
            .post("/stream-events")
            .jsonBody({ query: "adversarial" })
            .respondWith()
            .statusCode(200)
            .sseBody(rawResponseBody)
            .build();

        const response = await client.completions.streamEvents({ query: "adversarial" });
        const events: unknown[] = [];
        for await (const event of response) {
            events.push(event);
        }
        expect(events).toEqual([{ event: "completion", content: "sneaky" }]);
    });

    // ─── streamEventsContextProtocol (discriminator FROM SSE envelope) ──

    test("streamEventsContextProtocol: all three variants including EventEvent", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedServerSentEventsClient({ maxRetries: 0, environment: server.baseUrl });
        const rawResponseBody =
            'event: completion\ndata: {"content":"hello"}\n\nevent: error\ndata: {"error":"boom","code":503}\n\nevent: notification\ndata: {"name":"update ready"}\n\n';

        server
            .mockEndpoint()
            .post("/stream-events-context-protocol")
            .jsonBody({ query: "all-variants" })
            .respondWith()
            .statusCode(200)
            .sseBody(rawResponseBody)
            .build();

        const response = await client.completions.streamEventsContextProtocol({ query: "all-variants" });
        const events: unknown[] = [];
        for await (const event of response) {
            events.push(event);
        }
        expect(events).toEqual([
            { event: "completion", content: "hello" },
            { event: "error", error: "boom", code: 503 },
            { event: "notification", name: "update ready" },
        ]);
    });

    test("streamEventsContextProtocol: adversarial — data has discriminator key, data wins over envelope", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedServerSentEventsClient({ maxRetries: 0, environment: server.baseUrl });
        const rawResponseBody = 'event: error\ndata: {"event":"completion","content":"data wins"}\n\n';

        server
            .mockEndpoint()
            .post("/stream-events-context-protocol")
            .jsonBody({ query: "adversarial" })
            .respondWith()
            .statusCode(200)
            .sseBody(rawResponseBody)
            .build();

        const response = await client.completions.streamEventsContextProtocol({ query: "adversarial" });
        const events: unknown[] = [];
        for await (const event of response) {
            events.push(event);
        }
        expect(events).toEqual([{ event: "completion", content: "data wins" }]);
    });

    test("streamEventsContextProtocol: redundant event key in data matches envelope", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedServerSentEventsClient({ maxRetries: 0, environment: server.baseUrl });
        const rawResponseBody = 'event: error\ndata: {"event":"error","error":"redundant key"}\n\n';

        server
            .mockEndpoint()
            .post("/stream-events-context-protocol")
            .jsonBody({ query: "redundant" })
            .respondWith()
            .statusCode(200)
            .sseBody(rawResponseBody)
            .build();

        const response = await client.completions.streamEventsContextProtocol({ query: "redundant" });
        const events: unknown[] = [];
        for await (const event of response) {
            events.push(event);
        }
        expect(events).toEqual([{ event: "error", error: "redundant key" }]);
    });

    test("streamEventsContextProtocol: mixed injected, redundant, and conflicting discriminators", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedServerSentEventsClient({ maxRetries: 0, environment: server.baseUrl });
        const rawResponseBody =
            'event: completion\ndata: {"content":"first"}\n\n' +
            'event: error\ndata: {"event":"error","error":"second"}\n\n' +
            'event: error\ndata: {"event":"notification","name":"third"}\n\n';

        server
            .mockEndpoint()
            .post("/stream-events-context-protocol")
            .jsonBody({ query: "mixed" })
            .respondWith()
            .statusCode(200)
            .sseBody(rawResponseBody)
            .build();

        const response = await client.completions.streamEventsContextProtocol({ query: "mixed" });
        const events: unknown[] = [];
        for await (const event of response) {
            events.push(event);
        }
        expect(events).toEqual([
            { event: "completion", content: "first" },
            { event: "error", error: "second" },
            { event: "notification", name: "third" },
        ]);
    });

    test("streamEventsContextProtocol: error variant with optional code omitted", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedServerSentEventsClient({ maxRetries: 0, environment: server.baseUrl });
        const rawResponseBody = 'event: error\ndata: {"error":"no code here"}\n\n';

        server
            .mockEndpoint()
            .post("/stream-events-context-protocol")
            .jsonBody({ query: "no-code" })
            .respondWith()
            .statusCode(200)
            .sseBody(rawResponseBody)
            .build();

        const response = await client.completions.streamEventsContextProtocol({ query: "no-code" });
        const events: unknown[] = [];
        for await (const event of response) {
            events.push(event);
        }
        expect(events).toEqual([{ event: "error", error: "no code here" }]);
    });
});
TESTEOF

echo "=== Injected test file: $TEST_FILE ==="
echo "=== Installing dependencies ==="
cd "$FIXTURE_DIR"
pnpm install --frozen-lockfile 2>&1 || pnpm install 2>&1

echo ""
echo "=== Running SSE deserialization tests ==="
pnpm vitest run --project wire tests/wire/sse-deserialization.test.ts
