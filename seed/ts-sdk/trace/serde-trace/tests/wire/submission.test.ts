/**
 * This file was auto-generated by Fern from our API Definition.
 */

import { mockServerPool } from "../mock-server/MockServerPool";
import { SeedTraceClient } from "../../src/Client";

describe("Submission", () => {
    test("createExecutionSession", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedTraceClient({ token: "test", xRandomHeader: "test", environment: server.baseUrl });

        const rawResponseBody = {
            sessionId: "sessionId",
            executionSessionUrl: "executionSessionUrl",
            language: "JAVA",
            status: "CREATING_CONTAINER",
        };
        server
            .mockEndpoint()
            .post("/sessions/create-session/JAVA")
            .respondWith()
            .statusCode(200)
            .jsonBody(rawResponseBody)
            .build();

        const response = await client.submission.createExecutionSession("JAVA");
        expect(response).toEqual({
            sessionId: "sessionId",
            executionSessionUrl: "executionSessionUrl",
            language: "JAVA",
            status: "CREATING_CONTAINER",
        });
    });

    test("getExecutionSession", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedTraceClient({ token: "test", xRandomHeader: "test", environment: server.baseUrl });

        const rawResponseBody = {
            sessionId: "sessionId",
            executionSessionUrl: "executionSessionUrl",
            language: "JAVA",
            status: "CREATING_CONTAINER",
        };
        server
            .mockEndpoint()
            .get("/sessions/sessionId")
            .respondWith()
            .statusCode(200)
            .jsonBody(rawResponseBody)
            .build();

        const response = await client.submission.getExecutionSession("sessionId");
        expect(response).toEqual({
            sessionId: "sessionId",
            executionSessionUrl: "executionSessionUrl",
            language: "JAVA",
            status: "CREATING_CONTAINER",
        });
    });

    test("stopExecutionSession", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedTraceClient({ token: "test", xRandomHeader: "test", environment: server.baseUrl });

        server.mockEndpoint().delete("/sessions/stop/sessionId").respondWith().statusCode(200).build();

        const response = await client.submission.stopExecutionSession("sessionId");
        expect(response).toEqual(undefined);
    });

    test("getExecutionSessionsState", async () => {
        const server = mockServerPool.createServer();
        const client = new SeedTraceClient({ token: "test", xRandomHeader: "test", environment: server.baseUrl });

        const rawResponseBody = {
            states: {
                states: {
                    lastTimeContacted: "lastTimeContacted",
                    sessionId: "sessionId",
                    isWarmInstance: true,
                    awsTaskId: "awsTaskId",
                    language: "JAVA",
                    status: "CREATING_CONTAINER",
                },
            },
            numWarmingInstances: 1,
            warmingSessionIds: ["warmingSessionIds", "warmingSessionIds"],
        };
        server
            .mockEndpoint()
            .get("/sessions/execution-sessions-state")
            .respondWith()
            .statusCode(200)
            .jsonBody(rawResponseBody)
            .build();

        const response = await client.submission.getExecutionSessionsState();
        expect(response).toEqual({
            states: {
                states: {
                    lastTimeContacted: "lastTimeContacted",
                    sessionId: "sessionId",
                    isWarmInstance: true,
                    awsTaskId: "awsTaskId",
                    language: "JAVA",
                    status: "CREATING_CONTAINER",
                },
            },
            numWarmingInstances: 1,
            warmingSessionIds: ["warmingSessionIds", "warmingSessionIds"],
        });
    });
});
