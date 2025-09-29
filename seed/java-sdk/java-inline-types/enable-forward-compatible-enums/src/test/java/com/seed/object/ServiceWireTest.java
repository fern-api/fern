package com.seed.object;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.object.SeedObjectClient;
import com.seed.object.core.ObjectMappers;
import com.seed.object.requests.GetDiscriminatedUnionRequest;
import com.seed.object.requests.GetUndiscriminatedUnionRequest;
import com.seed.object.requests.PostRootRequest;
import com.seed.object.types.DiscriminatedUnion1;
import com.seed.object.types.DiscriminatedUnion1InlineType1;
import com.seed.object.types.DiscriminatedUnion1InlineType1InlineType1;
import com.seed.object.types.ReferenceType;
import com.seed.object.types.RequestTypeInlineType1;
import com.seed.object.types.RootType1;
import com.seed.object.types.UndiscriminatedUnion1;
import com.seed.object.types.UndiscriminatedUnion1InlineType1;
import com.seed.object.types.UndiscriminatedUnion1InlineType1InlineType1;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class ServiceWireTest {
    private MockWebServer server;
    private SeedObjectClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;
    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedObjectClient.builder()
            .url(server.url("/").toString())
            .build();
    }
    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }
    @Test
    public void testGetRoot() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"foo\":\"foo\",\"bar\":{\"foo\":\"foo\",\"bar\":{\"foo\":\"foo\",\"bar\":\"bar\",\"myEnum\":\"SUNNY\",\"ref\":{\"foo\":\"foo\"}},\"ref\":{\"foo\":\"foo\"}},\"fooMap\":{\"fooMap\":{\"foo\":\"foo\",\"ref\":{\"foo\":\"foo\"}}},\"fooList\":[{\"foo\":\"foo\",\"ref\":{\"foo\":\"foo\"}},{\"foo\":\"foo\",\"ref\":{\"foo\":\"foo\"}}],\"fooSet\":[{\"foo\":\"foo\",\"ref\":{\"foo\":\"foo\"}}],\"ref\":{\"foo\":\"foo\"}}"));
        RootType1 response = client.getRoot(
            PostRootRequest
                .builder()
                .bar(
                    RequestTypeInlineType1
                        .builder()
                        .foo("foo")
                        .build()
                )
                .foo("foo")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"bar\": {\n"
            + "    \"foo\": \"foo\"\n"
            + "  },\n"
            + "  \"foo\": \"foo\"\n"
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
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
            + "{\n"
            + "  \"foo\": \"foo\",\n"
            + "  \"bar\": {\n"
            + "    \"foo\": \"foo\",\n"
            + "    \"bar\": {\n"
            + "      \"foo\": \"foo\",\n"
            + "      \"bar\": \"bar\",\n"
            + "      \"myEnum\": \"SUNNY\",\n"
            + "      \"ref\": {\n"
            + "        \"foo\": \"foo\"\n"
            + "      }\n"
            + "    },\n"
            + "    \"ref\": {\n"
            + "      \"foo\": \"foo\"\n"
            + "    }\n"
            + "  },\n"
            + "  \"fooMap\": {\n"
            + "    \"fooMap\": {\n"
            + "      \"foo\": \"foo\",\n"
            + "      \"ref\": {\n"
            + "        \"foo\": \"foo\"\n"
            + "      }\n"
            + "    }\n"
            + "  },\n"
            + "  \"fooList\": [\n"
            + "    {\n"
            + "      \"foo\": \"foo\",\n"
            + "      \"ref\": {\n"
            + "        \"foo\": \"foo\"\n"
            + "      }\n"
            + "    },\n"
            + "    {\n"
            + "      \"foo\": \"foo\",\n"
            + "      \"ref\": {\n"
            + "        \"foo\": \"foo\"\n"
            + "      }\n"
            + "    }\n"
            + "  ],\n"
            + "  \"fooSet\": [\n"
            + "    {\n"
            + "      \"foo\": \"foo\",\n"
            + "      \"ref\": {\n"
            + "        \"foo\": \"foo\"\n"
            + "      }\n"
            + "    }\n"
            + "  ],\n"
            + "  \"ref\": {\n"
            + "    \"foo\": \"foo\"\n"
            + "  }\n"
            + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        if (actualResponseNode.has("type") || actualResponseNode.has("_type") || actualResponseNode.has("kind")) {
            String discriminator = null;
            if (actualResponseNode.has("type")) discriminator = actualResponseNode.get("type").asText();
            else if (actualResponseNode.has("_type")) discriminator = actualResponseNode.get("_type").asText();
            else if (actualResponseNode.has("kind")) discriminator = actualResponseNode.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        if (!actualResponseNode.isNull()) {
            Assertions.assertTrue(actualResponseNode.isObject() || actualResponseNode.isArray() || actualResponseNode.isValueNode(), "response should be a valid JSON value");
        }
        
        if (actualResponseNode.isArray()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Array should have valid size");
        }
        if (actualResponseNode.isObject()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Object should have valid field count");
        }
    }
    @Test
    public void testGetDiscriminatedUnion() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.getDiscriminatedUnion(
            GetDiscriminatedUnionRequest
                .builder()
                .bar(
                    DiscriminatedUnion1.type1(
                        DiscriminatedUnion1InlineType1
                            .builder()
                            .foo("foo")
                            .bar(
                                DiscriminatedUnion1InlineType1InlineType1
                                    .builder()
                                    .foo("foo")
                                    .ref(
                                        ReferenceType
                                            .builder()
                                            .foo("foo")
                                            .build()
                                    )
                                    .build()
                            )
                            .ref(
                                ReferenceType
                                    .builder()
                                    .foo("foo")
                                    .build()
                            )
                            .build()
                    )
                )
                .foo("foo")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"bar\": {\n"
            + "    \"type\": \"type1\",\n"
            + "    \"foo\": \"foo\",\n"
            + "    \"bar\": {\n"
            + "      \"foo\": \"foo\",\n"
            + "      \"ref\": {\n"
            + "        \"foo\": \"foo\"\n"
            + "      }\n"
            + "    },\n"
            + "    \"ref\": {\n"
            + "      \"foo\": \"foo\"\n"
            + "    }\n"
            + "  },\n"
            + "  \"foo\": \"foo\"\n"
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
    }
    @Test
    public void testGetUndiscriminatedUnion() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.getUndiscriminatedUnion(
            GetUndiscriminatedUnionRequest
                .builder()
                .bar(
                    UndiscriminatedUnion1.of(
                        UndiscriminatedUnion1InlineType1
                            .builder()
                            .foo("foo")
                            .bar(
                                UndiscriminatedUnion1InlineType1InlineType1
                                    .builder()
                                    .foo("foo")
                                    .ref(
                                        ReferenceType
                                            .builder()
                                            .foo("foo")
                                            .build()
                                    )
                                    .build()
                            )
                            .ref(
                                ReferenceType
                                    .builder()
                                    .foo("foo")
                                    .build()
                            )
                            .build()
                    )
                )
                .foo("foo")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"bar\": {\n"
            + "    \"foo\": \"foo\",\n"
            + "    \"bar\": {\n"
            + "      \"foo\": \"foo\",\n"
            + "      \"ref\": {\n"
            + "        \"foo\": \"foo\"\n"
            + "      }\n"
            + "    },\n"
            + "    \"ref\": {\n"
            + "      \"foo\": \"foo\"\n"
            + "    }\n"
            + "  },\n"
            + "  \"foo\": \"foo\"\n"
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
    }
}
