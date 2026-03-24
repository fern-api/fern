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
    //
    // In protocol mode, the SSE envelope's event type is the discriminator.
    // It must be injected into the data JSON under a key that does NOT
    // collide with any field in the variant types.
    //
    // Currently the generator uses "event" as the discriminator key, which
    // collides with EventEvent.event. The assertions below use "sseEvent"
    // as the discriminator key to express the correct behavior: the envelope
    // discriminator and the data payload fields are separate concerns.
    //
    // These tests are expected to FAIL until the generator is fixed.

    test("streamEventsContextProtocol: completion and error variants — envelope injects discriminator", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedServerSentEventsClient({ maxRetries: 0, environment: server.baseUrl });
        const rawResponseBody =
            'event: completion\ndata: {"content":"hello"}\n\nevent: error\ndata: {"error":"boom","code":503}\n\n';

        server
            .mockEndpoint()
            .post("/stream-events-context-protocol")
            .jsonBody({ query: "inject" })
            .respondWith()
            .statusCode(200)
            .sseBody(rawResponseBody)
            .build();

        const response = await client.completions.streamEventsContextProtocol({ query: "inject" });
        const events: unknown[] = [];
        for await (const event of response) {
            events.push(event);
        }
        expect(events).toEqual([
            { sseEvent: "completion", content: "hello" },
            { sseEvent: "error", error: "boom", code: 503 },
        ]);
    });

    test("streamEventsContextProtocol: EventEvent variant — envelope discriminator must not collide with data 'event' field", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedServerSentEventsClient({ maxRetries: 0, environment: server.baseUrl });
        // EventEvent has {event: string, name: string} in its data payload.
        // The envelope discriminator must use a different key so both values are preserved.
        const rawResponseBody = 'event: event\ndata: {"event":"update","name":"some particular update"}\n\n';

        server
            .mockEndpoint()
            .post("/stream-events-context-protocol")
            .jsonBody({ query: "event-variant" })
            .respondWith()
            .statusCode(200)
            .sseBody(rawResponseBody)
            .build();

        const response = await client.completions.streamEventsContextProtocol({ query: "event-variant" });
        const events: unknown[] = [];
        for await (const event of response) {
            events.push(event);
        }
        expect(events).toEqual([{ sseEvent: "event", event: "update", name: "some particular update" }]);
    });

    test("streamEventsContextProtocol: all three variants", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedServerSentEventsClient({ maxRetries: 0, environment: server.baseUrl });
        const rawResponseBody =
            'event: completion\ndata: {"content":"hello"}\n\n' +
            'event: error\ndata: {"error":"something went wrong"}\n\n' +
            'event: event\ndata: {"event":"update","name":"some particular update"}\n\n';

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
            { sseEvent: "completion", content: "hello" },
            { sseEvent: "error", error: "something went wrong" },
            { sseEvent: "event", event: "update", name: "some particular update" },
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
        expect(events).toEqual([{ sseEvent: "error", error: "no code here" }]);
    });
});
TESTEOF

echo "=== Injected test file: $TEST_FILE ==="
echo "=== Installing dependencies ==="
cd "$FIXTURE_DIR"
pnpm install --frozen-lockfile 2>&1 || pnpm install 2>&1

echo ""
echo "=== Running SSE deserialization tests ==="
echo "=== NOTE: streamEventsContextProtocol tests are EXPECTED to fail ==="
echo "=== They assert correct behavior using 'sseEvent' as the discriminator key ==="
echo "=== to avoid collision with EventEvent.event — the generator must be fixed ==="
echo ""
pnpm vitest run --project wire tests/wire/sse-deserialization.test.ts
