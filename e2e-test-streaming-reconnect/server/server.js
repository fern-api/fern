/**
 * Fake SSE server with reconnection support for E2E testing.
 *
 * Behavior:
 * - POST /stream: Returns an SSE stream of 10 events, BUT drops the connection after event 5.
 * - On reconnect with Last-Event-ID header, resumes from the next event after the given ID.
 * - Sends [[DONE]] terminator after the last event.
 * - POST /stream-non-resumable: Returns all 10 events without dropping (control test).
 * - GET /health: health check
 */

const http = require("http");

const PORT = process.env.PORT || 8199;
const TOTAL_EVENTS = 10;
const DROP_AFTER_EVENT = 5;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const server = http.createServer(async (req, res) => {
    const lastEventId = req.headers["last-event-id"] || "none";
    console.log(`${req.method} ${req.url} Last-Event-ID=${lastEventId}`);

    if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok" }));
        return;
    }

    // Consume request body
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString();

    if (req.method === "POST" && req.url === "/stream") {
        const lastId = req.headers["last-event-id"];
        const startFrom = lastId ? parseInt(lastId, 10) + 1 : 1;
        const isReconnect = lastId != null;
        const shouldDrop = !isReconnect;

        console.log(`[stream] startFrom=${startFrom} isReconnect=${isReconnect} shouldDrop=${shouldDrop}`);

        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        });
        res.flushHeaders();

        for (let i = startFrom; i <= TOTAL_EVENTS; i++) {
            // Drop connection after DROP_AFTER_EVENT on first attempt
            if (shouldDrop && i > DROP_AFTER_EVENT) {
                console.log(`[stream] Dropping connection after event ${DROP_AFTER_EVENT}`);
                res.destroy();
                return;
            }

            const data = { delta: `chunk_${i}`, tokens: i };
            res.write(`id: ${i}\ndata: ${JSON.stringify(data)}\n\n`);
            console.log(`[stream] Sent event ${i}`);
            await sleep(10);
        }

        // Send terminator
        res.write(`data: [[DONE]]\n\n`);
        res.end();
        console.log(`[stream] Done`);
        return;
    }

    if (req.method === "POST" && req.url === "/stream-non-resumable") {
        console.log(`[stream-non-resumable] Sending all ${TOTAL_EVENTS} events`);

        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        });
        res.flushHeaders();

        for (let i = 1; i <= TOTAL_EVENTS; i++) {
            const data = { delta: `chunk_${i}`, tokens: i };
            res.write(`id: ${i}\ndata: ${JSON.stringify(data)}\n\n`);
            await sleep(10);
        }

        res.write(`data: [[DONE]]\n\n`);
        res.end();
        console.log(`[stream-non-resumable] Done`);
        return;
    }

    res.writeHead(404);
    res.end("Not found");
});

server.listen(PORT, () => {
    console.log(`SSE test server listening on http://localhost:${PORT}`);
    console.log(`  POST /stream - drops after ${DROP_AFTER_EVENT} events, resumes on reconnect`);
    console.log(`  POST /stream-non-resumable - sends all ${TOTAL_EVENTS} events without dropping`);
    console.log(`  GET /health - health check`);
});
