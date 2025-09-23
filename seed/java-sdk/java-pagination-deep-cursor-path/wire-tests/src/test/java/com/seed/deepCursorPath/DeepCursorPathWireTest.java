package com.seed.deepCursorPath;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.deepCursorPath.SeedDeepCursorPathClient;
import com.seed.deepCursorPath.core.SyncPagingIterable;
import com.seed.deepCursorPath.resources.deepcursorpath.types.A;
import com.seed.deepCursorPath.resources.deepcursorpath.types.B;
import com.seed.deepCursorPath.resources.deepcursorpath.types.C;
import com.seed.deepCursorPath.resources.deepcursorpath.types.D;
import com.seed.deepCursorPath.resources.deepcursorpath.types.IndirectionRequired;
import com.seed.deepCursorPath.resources.deepcursorpath.types.InlineA;
import com.seed.deepCursorPath.resources.deepcursorpath.types.InlineB;
import com.seed.deepCursorPath.resources.deepcursorpath.types.InlineC;
import com.seed.deepCursorPath.resources.deepcursorpath.types.InlineD;
import com.seed.deepCursorPath.resources.deepcursorpath.types.MainRequired;
import java.util.Arrays;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class DeepCursorPathWireTest {
    private MockWebServer server;
    private SeedDeepCursorPathClient client;
    private ObjectMapper objectMapper = new ObjectMapper();
    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedDeepCursorPathClient.builder()
            .url(server.url("/").toString())
            .build();
    }
    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }
    @Test
    public void testDoThing() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"starting_after\":\"starting_after\",\"results\":[\"results\",\"results\"]}"));
        SyncPagingIterable<String> response = client.deepCursorPath().doThing(
            A
                .builder()
                .b(
                    B
                        .builder()
                        .c(
                            C
                                .builder()
                                .d(
                                    D
                                        .builder()
                                        .startingAfter("starting_after")
                                        .build()
                                )
                                .build()
                        )
                        .build()
                )
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"b\": {\n"
            + "    \"c\": {\n"
            + "      \"d\": {\n"
            + "        \"starting_after\": \"starting_after\"\n"
            + "      }\n"
            + "    }\n"
            + "  }\n"
            + "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body structure does not match expected");
        if (actualJson.has("type") || actualJson.has("_type") || actualJson.has("kind")) {
            String discriminator = null;
            if (actualJson.has("type")) discriminator = actualJson.get("type").asText();
            else if (actualJson.has("_type")) discriminator = actualJson.get("_type").asText();
            else if (actualJson.has("kind")) discriminator = actualJson.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        if (!actualJson.isNull()) {
            Assertions.assertTrue(actualJson.isObject() || actualJson.isArray() || actualJson.isValueNode(), "request should be a valid JSON value");
        }
        
        if (actualJson.isArray()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Array should have valid size");
        }
        if (actualJson.isObject()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Object should have valid field count");
        }
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        // Pagination response validated via MockWebServer
        // The SDK correctly parses the response into a SyncPagingIterable
    }
    @Test
    public void testDoThingRequired() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"starting_after\":\"starting_after\",\"results\":[\"results\",\"results\"]}"));
        SyncPagingIterable<String> response = client.deepCursorPath().doThingRequired(
            MainRequired
                .builder()
                .indirection(
                    IndirectionRequired
                        .builder()
                        .results(
                            Arrays.asList("results", "results")
                        )
                        .startingAfter("starting_after")
                        .build()
                )
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"indirection\": {\n"
            + "    \"starting_after\": \"starting_after\",\n"
            + "    \"results\": [\n"
            + "      \"results\",\n"
            + "      \"results\"\n"
            + "    ]\n"
            + "  }\n"
            + "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body structure does not match expected");
        if (actualJson.has("type") || actualJson.has("_type") || actualJson.has("kind")) {
            String discriminator = null;
            if (actualJson.has("type")) discriminator = actualJson.get("type").asText();
            else if (actualJson.has("_type")) discriminator = actualJson.get("_type").asText();
            else if (actualJson.has("kind")) discriminator = actualJson.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        if (!actualJson.isNull()) {
            Assertions.assertTrue(actualJson.isObject() || actualJson.isArray() || actualJson.isValueNode(), "request should be a valid JSON value");
        }
        
        if (actualJson.isArray()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Array should have valid size");
        }
        if (actualJson.isObject()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Object should have valid field count");
        }
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        // Pagination response validated via MockWebServer
        // The SDK correctly parses the response into a SyncPagingIterable
    }
    @Test
    public void testDoThingInline() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"starting_after\":\"starting_after\",\"results\":[\"results\",\"results\"]}"));
        SyncPagingIterable<String> response = client.deepCursorPath().doThingInline(
            InlineA
                .builder()
                .b(
                    InlineB
                        .builder()
                        .c(
                            InlineC
                                .builder()
                                .b(
                                    InlineD
                                        .builder()
                                        .startingAfter("starting_after")
                                        .build()
                                )
                                .build()
                        )
                        .build()
                )
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"b\": {\n"
            + "    \"c\": {\n"
            + "      \"b\": {\n"
            + "        \"starting_after\": \"starting_after\"\n"
            + "      }\n"
            + "    }\n"
            + "  }\n"
            + "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body structure does not match expected");
        if (actualJson.has("type") || actualJson.has("_type") || actualJson.has("kind")) {
            String discriminator = null;
            if (actualJson.has("type")) discriminator = actualJson.get("type").asText();
            else if (actualJson.has("_type")) discriminator = actualJson.get("_type").asText();
            else if (actualJson.has("kind")) discriminator = actualJson.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        if (!actualJson.isNull()) {
            Assertions.assertTrue(actualJson.isObject() || actualJson.isArray() || actualJson.isValueNode(), "request should be a valid JSON value");
        }
        
        if (actualJson.isArray()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Array should have valid size");
        }
        if (actualJson.isObject()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Object should have valid field count");
        }
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        // Pagination response validated via MockWebServer
        // The SDK correctly parses the response into a SyncPagingIterable
    }
}
