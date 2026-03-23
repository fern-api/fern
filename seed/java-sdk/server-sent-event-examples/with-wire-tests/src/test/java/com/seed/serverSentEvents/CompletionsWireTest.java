package com.seed.serverSentEvents;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.serverSentEvents.core.ObjectMappers;
import com.seed.serverSentEvents.resources.completions.requests.StreamCompletionRequest;
import com.seed.serverSentEvents.resources.completions.requests.StreamEventsRequest;
import com.seed.serverSentEvents.resources.completions.types.StreamEvent;
import com.seed.serverSentEvents.resources.completions.types.StreamEventContextProtocol;
import com.seed.serverSentEvents.resources.completions.types.StreamedCompletion;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class CompletionsWireTest {
    private MockWebServer server;
    private SeedServerSentEventsClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;

    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedServerSentEventsClient.builder()
                .url(server.url("/").toString())
                .build();
    }

    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }

    @Test
    public void testStream() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setHeader("Content-Type", "text/event-stream")
                        .setBody(
                                "event: completion\ndata: {\"delta\":\"foo\",\"tokens\":1}\n\nevent: completion\ndata: {\"delta\":\"bar\",\"tokens\":2}\n\ndata: [[DONE]]\n"));
        Iterable<StreamedCompletion> response = client.completions().stream(
                StreamCompletionRequest.builder().query("foo").build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "" + "{\n" + "  \"query\": \"foo\"\n" + "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertTrue(jsonEquals(expectedJson, actualJson), "Request body structure does not match expected");
        if (actualJson.has("type") || actualJson.has("_type") || actualJson.has("kind")) {
            String discriminator = null;
            if (actualJson.has("type")) discriminator = actualJson.get("type").asText();
            else if (actualJson.has("_type"))
                discriminator = actualJson.get("_type").asText();
            else if (actualJson.has("kind"))
                discriminator = actualJson.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }

        if (!actualJson.isNull()) {
            Assertions.assertTrue(
                    actualJson.isObject() || actualJson.isArray() || actualJson.isValueNode(),
                    "request should be a valid JSON value");
        }

        if (actualJson.isArray()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Array should have valid size");
        }
        if (actualJson.isObject()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Object should have valid field count");
        }

        // Validate SSE stream events
        Assertions.assertNotNull(response, "Response should not be null");
        java.util.List<Object> events = new java.util.ArrayList<>();
        for (Object event : response) {
            events.add(event);
        }
        Assertions.assertEquals(2, events.size(), "Expected 2 SSE event(s)");

        // Validate event 0
        String event0Json = objectMapper.writeValueAsString(events.get(0));
        JsonNode event0Node = objectMapper.readTree(event0Json);
        String expectedEvent0Json = "" + "{\n" + "  \"delta\": \"foo\",\n" + "  \"tokens\": 1\n" + "}";
        JsonNode expectedEvent0Node = objectMapper.readTree(expectedEvent0Json);
        Assertions.assertTrue(
                jsonEquals(expectedEvent0Node, event0Node), "SSE event 0 content does not match expected");

        // Validate event 1
        String event1Json = objectMapper.writeValueAsString(events.get(1));
        JsonNode event1Node = objectMapper.readTree(event1Json);
        String expectedEvent1Json = "" + "{\n" + "  \"delta\": \"bar\",\n" + "  \"tokens\": 2\n" + "}";
        JsonNode expectedEvent1Node = objectMapper.readTree(expectedEvent1Json);
        Assertions.assertTrue(
                jsonEquals(expectedEvent1Node, event1Node), "SSE event 1 content does not match expected");
    }

    @Test
    public void testStreamEvents() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setHeader("Content-Type", "text/event-stream")
                        .setBody(
                                "event: message\ndata: {\"event\":\"completion\",\"content\":\"hello\"}\n\nevent: message\ndata: {\"event\":\"error\",\"error\":\"something went wrong\"}\n\ndata: [DONE]\n"));
        Iterable<StreamEvent> response = client.completions()
                .streamEvents(StreamEventsRequest.builder().query("query").build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "" + "{\n" + "  \"query\": \"query\"\n" + "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertTrue(jsonEquals(expectedJson, actualJson), "Request body structure does not match expected");
        if (actualJson.has("type") || actualJson.has("_type") || actualJson.has("kind")) {
            String discriminator = null;
            if (actualJson.has("type")) discriminator = actualJson.get("type").asText();
            else if (actualJson.has("_type"))
                discriminator = actualJson.get("_type").asText();
            else if (actualJson.has("kind"))
                discriminator = actualJson.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }

        if (!actualJson.isNull()) {
            Assertions.assertTrue(
                    actualJson.isObject() || actualJson.isArray() || actualJson.isValueNode(),
                    "request should be a valid JSON value");
        }

        if (actualJson.isArray()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Array should have valid size");
        }
        if (actualJson.isObject()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Object should have valid field count");
        }

        // Validate SSE stream events
        Assertions.assertNotNull(response, "Response should not be null");
        java.util.List<Object> events = new java.util.ArrayList<>();
        for (Object event : response) {
            events.add(event);
        }
        Assertions.assertEquals(2, events.size(), "Expected 2 SSE event(s)");

        // Validate event 0
        String event0Json = objectMapper.writeValueAsString(events.get(0));
        JsonNode event0Node = objectMapper.readTree(event0Json);
        String expectedEvent0Json = "" + "{\n" + "  \"event\": \"completion\",\n" + "  \"content\": \"hello\"\n" + "}";
        JsonNode expectedEvent0Node = objectMapper.readTree(expectedEvent0Json);
        Assertions.assertTrue(
                jsonEquals(expectedEvent0Node, event0Node), "SSE event 0 content does not match expected");

        // Validate event 1
        String event1Json = objectMapper.writeValueAsString(events.get(1));
        JsonNode event1Node = objectMapper.readTree(event1Json);
        String expectedEvent1Json =
                "" + "{\n" + "  \"event\": \"error\",\n" + "  \"error\": \"something went wrong\"\n" + "}";
        JsonNode expectedEvent1Node = objectMapper.readTree(expectedEvent1Json);
        Assertions.assertTrue(
                jsonEquals(expectedEvent1Node, event1Node), "SSE event 1 content does not match expected");
    }

    @Test
    public void testStreamEventsContextProtocol() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setHeader("Content-Type", "text/event-stream")
                        .setBody(
                                "event: completion\ndata: {\"content\":\"hello\"}\n\nevent: error\ndata: {\"error\":\"something went wrong\"}\n\ndata: [DONE]\n"));
        Iterable<StreamEventContextProtocol> response = client.completions()
                .streamEventsContextProtocol(
                        StreamEventsRequest.builder().query("query").build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "" + "{\n" + "  \"query\": \"query\"\n" + "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertTrue(jsonEquals(expectedJson, actualJson), "Request body structure does not match expected");
        if (actualJson.has("type") || actualJson.has("_type") || actualJson.has("kind")) {
            String discriminator = null;
            if (actualJson.has("type")) discriminator = actualJson.get("type").asText();
            else if (actualJson.has("_type"))
                discriminator = actualJson.get("_type").asText();
            else if (actualJson.has("kind"))
                discriminator = actualJson.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }

        if (!actualJson.isNull()) {
            Assertions.assertTrue(
                    actualJson.isObject() || actualJson.isArray() || actualJson.isValueNode(),
                    "request should be a valid JSON value");
        }

        if (actualJson.isArray()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Array should have valid size");
        }
        if (actualJson.isObject()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Object should have valid field count");
        }

        // Validate SSE stream events
        Assertions.assertNotNull(response, "Response should not be null");
        java.util.List<Object> events = new java.util.ArrayList<>();
        for (Object event : response) {
            events.add(event);
        }
        Assertions.assertEquals(2, events.size(), "Expected 2 SSE event(s)");

        // Validate event 0
        String event0Json = objectMapper.writeValueAsString(events.get(0));
        JsonNode event0Node = objectMapper.readTree(event0Json);
        String expectedEvent0Json = "" + "{\n" + "  \"content\": \"hello\",\n" + "  \"event\": \"completion\"\n" + "}";
        JsonNode expectedEvent0Node = objectMapper.readTree(expectedEvent0Json);
        Assertions.assertTrue(
                jsonEquals(expectedEvent0Node, event0Node), "SSE event 0 content does not match expected");

        // Validate event 1
        String event1Json = objectMapper.writeValueAsString(events.get(1));
        JsonNode event1Node = objectMapper.readTree(event1Json);
        String expectedEvent1Json =
                "" + "{\n" + "  \"error\": \"something went wrong\",\n" + "  \"event\": \"error\"\n" + "}";
        JsonNode expectedEvent1Node = objectMapper.readTree(expectedEvent1Json);
        Assertions.assertTrue(
                jsonEquals(expectedEvent1Node, event1Node), "SSE event 1 content does not match expected");
    }

    /**
     * Compares two JsonNodes with numeric equivalence and null safety.
     * For objects, checks that all fields in 'expected' exist in 'actual' with matching values.
     * Allows 'actual' to have extra fields (e.g., default values added during serialization).
     */
    private boolean jsonEquals(JsonNode expected, JsonNode actual) {
        if (expected == null && actual == null) return true;
        if (expected == null || actual == null) return false;
        if (expected.equals(actual)) return true;
        if (expected.isNumber() && actual.isNumber())
            return Math.abs(expected.doubleValue() - actual.doubleValue()) < 1e-10;
        if (expected.isObject() && actual.isObject()) {
            java.util.Iterator<java.util.Map.Entry<String, JsonNode>> iter = expected.fields();
            while (iter.hasNext()) {
                java.util.Map.Entry<String, JsonNode> entry = iter.next();
                JsonNode actualValue = actual.get(entry.getKey());
                if (actualValue == null || !jsonEquals(entry.getValue(), actualValue)) return false;
            }
            return true;
        }
        if (expected.isArray() && actual.isArray()) {
            if (expected.size() != actual.size()) return false;
            for (int i = 0; i < expected.size(); i++) {
                if (!jsonEquals(expected.get(i), actual.get(i))) return false;
            }
            return true;
        }
        return false;
    }
}
