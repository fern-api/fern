package com.seed.exhaustive;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class EndpointsObjectWireTest {
    private MockWebServer server;
    private SeedExhaustiveClient client;
    private ObjectMapper objectMapper = new ObjectMapper();
    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedExhaustiveClient.builder()
            .url(server.url("/").toString())
            .token("test-token")
            .build();
    }
    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }
    @Test
    public void testGetAndReturnWithOptionalField() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"string\":\"string\",\"integer\":1,\"long\":1000000,\"double\":1.1,\"bool\":true,\"datetime\":\"2024-01-15T09:30:00Z\",\"date\":\"2023-01-15\",\"uuid\":\"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\"base64\":\"SGVsbG8gd29ybGQh\",\"list\":[\"list\",\"list\"],\"set\":[\"set\"],\"map\":{\"1\":\"map\"},\"bigint\":\"1000000\"}"));
        ObjectWithOptionalField response = client.endpoints().object().getAndReturnWithOptionalField(
            ObjectWithOptionalField
                .builder()
                .string("string")
                .integer(1)
                .long_(1000000L)
                .double_(1.1)
                .bool(true)
                .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .date("2023-01-15")
                .uuid(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                .base64("SGVsbG8gd29ybGQh".getBytes())
                .list(
                    Optional.of(
                        Arrays.asList("list", "list")
                    )
                )
                .set(
                    new HashSet<String>(
                        Arrays.asList("set")
                    )
                )
                .map(
                    new HashMap<Integer, String>() {{
                        put(1, "map");
                    }}
                )
                .bigint(new BigInteger("1000000"))
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"string\": \"string\",\n"
            + "  \"integer\": 1,\n"
            + "  \"long\": 1000000,\n"
            + "  \"double\": 1.1,\n"
            + "  \"bool\": true,\n"
            + "  \"datetime\": \"2024-01-15T09:30:00Z\",\n"
            + "  \"date\": \"2023-01-15\",\n"
            + "  \"uuid\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "  \"base64\": \"SGVsbG8gd29ybGQh\",\n"
            + "  \"list\": [\n"
            + "    \"list\",\n"
            + "    \"list\"\n"
            + "  ],\n"
            + "  \"set\": [\n"
            + "    \"set\"\n"
            + "  ],\n"
            + "  \"map\": {\n"
            + "    \"1\": \"map\"\n"
            + "  },\n"
            + "  \"bigint\": \"1000000\"\n"
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
            + "  \"string\": \"string\",\n"
            + "  \"integer\": 1,\n"
            + "  \"long\": 1000000,\n"
            + "  \"double\": 1.1,\n"
            + "  \"bool\": true,\n"
            + "  \"datetime\": \"2024-01-15T09:30:00Z\",\n"
            + "  \"date\": \"2023-01-15\",\n"
            + "  \"uuid\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "  \"base64\": \"SGVsbG8gd29ybGQh\",\n"
            + "  \"list\": [\n"
            + "    \"list\",\n"
            + "    \"list\"\n"
            + "  ],\n"
            + "  \"set\": [\n"
            + "    \"set\"\n"
            + "  ],\n"
            + "  \"map\": {\n"
            + "    \"1\": \"map\"\n"
            + "  },\n"
            + "  \"bigint\": \"1000000\"\n"
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
    public void testGetAndReturnWithRequiredField() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"string\":\"string\"}"));
        ObjectWithRequiredField response = client.endpoints().object().getAndReturnWithRequiredField(
            ObjectWithRequiredField
                .builder()
                .string("string")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"string\": \"string\"\n"
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
            + "  \"string\": \"string\"\n"
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
    public void testGetAndReturnWithMapOfMap() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"map\":{\"map\":{\"map\":\"map\"}}}"));
        ObjectWithMapOfMap response = client.endpoints().object().getAndReturnWithMapOfMap(
            ObjectWithMapOfMap
                .builder()
                .map(
                    new HashMap<String, Map<String, String>>() {{
                        put("map", new HashMap<String, String>() {{
                            put("map", "map");
                        }});
                    }}
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
            + "  \"map\": {\n"
            + "    \"map\": {\n"
            + "      \"map\": \"map\"\n"
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
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
            + "{\n"
            + "  \"map\": {\n"
            + "    \"map\": {\n"
            + "      \"map\": \"map\"\n"
            + "    }\n"
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
    public void testGetAndReturnNestedWithOptionalField() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"string\":\"string\",\"NestedObject\":{\"string\":\"string\",\"integer\":1,\"long\":1000000,\"double\":1.1,\"bool\":true,\"datetime\":\"2024-01-15T09:30:00Z\",\"date\":\"2023-01-15\",\"uuid\":\"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\"base64\":\"SGVsbG8gd29ybGQh\",\"list\":[\"list\",\"list\"],\"set\":[\"set\"],\"map\":{\"1\":\"map\"},\"bigint\":\"1000000\"}}"));
        NestedObjectWithOptionalField response = client.endpoints().object().getAndReturnNestedWithOptionalField(
            NestedObjectWithOptionalField
                .builder()
                .string("string")
                .nestedObject(
                    ObjectWithOptionalField
                        .builder()
                        .string("string")
                        .integer(1)
                        .long_(1000000L)
                        .double_(1.1)
                        .bool(true)
                        .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .date("2023-01-15")
                        .uuid(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                        .base64("SGVsbG8gd29ybGQh".getBytes())
                        .list(
                            Optional.of(
                                Arrays.asList("list", "list")
                            )
                        )
                        .set(
                            new HashSet<String>(
                                Arrays.asList("set")
                            )
                        )
                        .map(
                            new HashMap<Integer, String>() {{
                                put(1, "map");
                            }}
                        )
                        .bigint(new BigInteger("1000000"))
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
            + "  \"string\": \"string\",\n"
            + "  \"NestedObject\": {\n"
            + "    \"string\": \"string\",\n"
            + "    \"integer\": 1,\n"
            + "    \"long\": 1000000,\n"
            + "    \"double\": 1.1,\n"
            + "    \"bool\": true,\n"
            + "    \"datetime\": \"2024-01-15T09:30:00Z\",\n"
            + "    \"date\": \"2023-01-15\",\n"
            + "    \"uuid\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "    \"base64\": \"SGVsbG8gd29ybGQh\",\n"
            + "    \"list\": [\n"
            + "      \"list\",\n"
            + "      \"list\"\n"
            + "    ],\n"
            + "    \"set\": [\n"
            + "      \"set\"\n"
            + "    ],\n"
            + "    \"map\": {\n"
            + "      \"1\": \"map\"\n"
            + "    },\n"
            + "    \"bigint\": \"1000000\"\n"
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
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
            + "{\n"
            + "  \"string\": \"string\",\n"
            + "  \"NestedObject\": {\n"
            + "    \"string\": \"string\",\n"
            + "    \"integer\": 1,\n"
            + "    \"long\": 1000000,\n"
            + "    \"double\": 1.1,\n"
            + "    \"bool\": true,\n"
            + "    \"datetime\": \"2024-01-15T09:30:00Z\",\n"
            + "    \"date\": \"2023-01-15\",\n"
            + "    \"uuid\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "    \"base64\": \"SGVsbG8gd29ybGQh\",\n"
            + "    \"list\": [\n"
            + "      \"list\",\n"
            + "      \"list\"\n"
            + "    ],\n"
            + "    \"set\": [\n"
            + "      \"set\"\n"
            + "    ],\n"
            + "    \"map\": {\n"
            + "      \"1\": \"map\"\n"
            + "    },\n"
            + "    \"bigint\": \"1000000\"\n"
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
    public void testGetAndReturnNestedWithRequiredField() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"string\":\"string\",\"NestedObject\":{\"string\":\"string\",\"integer\":1,\"long\":1000000,\"double\":1.1,\"bool\":true,\"datetime\":\"2024-01-15T09:30:00Z\",\"date\":\"2023-01-15\",\"uuid\":\"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\"base64\":\"SGVsbG8gd29ybGQh\",\"list\":[\"list\",\"list\"],\"set\":[\"set\"],\"map\":{\"1\":\"map\"},\"bigint\":\"1000000\"}}"));
        NestedObjectWithRequiredField response = client.endpoints().object().getAndReturnNestedWithRequiredField(
            "string",
            NestedObjectWithRequiredField
                .builder()
                .string("string")
                .nestedObject(
                    ObjectWithOptionalField
                        .builder()
                        .string("string")
                        .integer(1)
                        .long_(1000000L)
                        .double_(1.1)
                        .bool(true)
                        .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .date("2023-01-15")
                        .uuid(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                        .base64("SGVsbG8gd29ybGQh".getBytes())
                        .list(
                            Optional.of(
                                Arrays.asList("list", "list")
                            )
                        )
                        .set(
                            new HashSet<String>(
                                Arrays.asList("set")
                            )
                        )
                        .map(
                            new HashMap<Integer, String>() {{
                                put(1, "map");
                            }}
                        )
                        .bigint(new BigInteger("1000000"))
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
            + "  \"string\": \"string\",\n"
            + "  \"NestedObject\": {\n"
            + "    \"string\": \"string\",\n"
            + "    \"integer\": 1,\n"
            + "    \"long\": 1000000,\n"
            + "    \"double\": 1.1,\n"
            + "    \"bool\": true,\n"
            + "    \"datetime\": \"2024-01-15T09:30:00Z\",\n"
            + "    \"date\": \"2023-01-15\",\n"
            + "    \"uuid\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "    \"base64\": \"SGVsbG8gd29ybGQh\",\n"
            + "    \"list\": [\n"
            + "      \"list\",\n"
            + "      \"list\"\n"
            + "    ],\n"
            + "    \"set\": [\n"
            + "      \"set\"\n"
            + "    ],\n"
            + "    \"map\": {\n"
            + "      \"1\": \"map\"\n"
            + "    },\n"
            + "    \"bigint\": \"1000000\"\n"
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
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
            + "{\n"
            + "  \"string\": \"string\",\n"
            + "  \"NestedObject\": {\n"
            + "    \"string\": \"string\",\n"
            + "    \"integer\": 1,\n"
            + "    \"long\": 1000000,\n"
            + "    \"double\": 1.1,\n"
            + "    \"bool\": true,\n"
            + "    \"datetime\": \"2024-01-15T09:30:00Z\",\n"
            + "    \"date\": \"2023-01-15\",\n"
            + "    \"uuid\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "    \"base64\": \"SGVsbG8gd29ybGQh\",\n"
            + "    \"list\": [\n"
            + "      \"list\",\n"
            + "      \"list\"\n"
            + "    ],\n"
            + "    \"set\": [\n"
            + "      \"set\"\n"
            + "    ],\n"
            + "    \"map\": {\n"
            + "      \"1\": \"map\"\n"
            + "    },\n"
            + "    \"bigint\": \"1000000\"\n"
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
    public void testGetAndReturnNestedWithRequiredFieldAsList() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"string\":\"string\",\"NestedObject\":{\"string\":\"string\",\"integer\":1,\"long\":1000000,\"double\":1.1,\"bool\":true,\"datetime\":\"2024-01-15T09:30:00Z\",\"date\":\"2023-01-15\",\"uuid\":\"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\"base64\":\"SGVsbG8gd29ybGQh\",\"list\":[\"list\",\"list\"],\"set\":[\"set\"],\"map\":{\"1\":\"map\"},\"bigint\":\"1000000\"}}"));
        NestedObjectWithRequiredField response = client.endpoints().object().getAndReturnNestedWithRequiredFieldAsList(
            Arrays.asList(
                NestedObjectWithRequiredField
                    .builder()
                    .string("string")
                    .nestedObject(
                        ObjectWithOptionalField
                            .builder()
                            .string("string")
                            .integer(1)
                            .long_(1000000L)
                            .double_(1.1)
                            .bool(true)
                            .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                            .date("2023-01-15")
                            .uuid(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                            .base64("SGVsbG8gd29ybGQh".getBytes())
                            .list(
                                Optional.of(
                                    Arrays.asList("list", "list")
                                )
                            )
                            .set(
                                new HashSet<String>(
                                    Arrays.asList("set")
                                )
                            )
                            .map(
                                new HashMap<Integer, String>() {{
                                    put(1, "map");
                                }}
                            )
                            .bigint(new BigInteger("1000000"))
                            .build()
                    )
                    .build(),
                NestedObjectWithRequiredField
                    .builder()
                    .string("string")
                    .nestedObject(
                        ObjectWithOptionalField
                            .builder()
                            .string("string")
                            .integer(1)
                            .long_(1000000L)
                            .double_(1.1)
                            .bool(true)
                            .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                            .date("2023-01-15")
                            .uuid(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                            .base64("SGVsbG8gd29ybGQh".getBytes())
                            .list(
                                Optional.of(
                                    Arrays.asList("list", "list")
                                )
                            )
                            .set(
                                new HashSet<String>(
                                    Arrays.asList("set")
                                )
                            )
                            .map(
                                new HashMap<Integer, String>() {{
                                    put(1, "map");
                                }}
                            )
                            .bigint(new BigInteger("1000000"))
                            .build()
                    )
                    .build()
            )
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "[\n"
            + "  {\n"
            + "    \"string\": \"string\",\n"
            + "    \"NestedObject\": {\n"
            + "      \"string\": \"string\",\n"
            + "      \"integer\": 1,\n"
            + "      \"long\": 1000000,\n"
            + "      \"double\": 1.1,\n"
            + "      \"bool\": true,\n"
            + "      \"datetime\": \"2024-01-15T09:30:00Z\",\n"
            + "      \"date\": \"2023-01-15\",\n"
            + "      \"uuid\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "      \"base64\": \"SGVsbG8gd29ybGQh\",\n"
            + "      \"list\": [\n"
            + "        \"list\",\n"
            + "        \"list\"\n"
            + "      ],\n"
            + "      \"set\": [\n"
            + "        \"set\"\n"
            + "      ],\n"
            + "      \"map\": {\n"
            + "        \"1\": \"map\"\n"
            + "      },\n"
            + "      \"bigint\": \"1000000\"\n"
            + "    }\n"
            + "  },\n"
            + "  {\n"
            + "    \"string\": \"string\",\n"
            + "    \"NestedObject\": {\n"
            + "      \"string\": \"string\",\n"
            + "      \"integer\": 1,\n"
            + "      \"long\": 1000000,\n"
            + "      \"double\": 1.1,\n"
            + "      \"bool\": true,\n"
            + "      \"datetime\": \"2024-01-15T09:30:00Z\",\n"
            + "      \"date\": \"2023-01-15\",\n"
            + "      \"uuid\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "      \"base64\": \"SGVsbG8gd29ybGQh\",\n"
            + "      \"list\": [\n"
            + "        \"list\",\n"
            + "        \"list\"\n"
            + "      ],\n"
            + "      \"set\": [\n"
            + "        \"set\"\n"
            + "      ],\n"
            + "      \"map\": {\n"
            + "        \"1\": \"map\"\n"
            + "      },\n"
            + "      \"bigint\": \"1000000\"\n"
            + "    }\n"
            + "  }\n"
            + "]";
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
            + "  \"string\": \"string\",\n"
            + "  \"NestedObject\": {\n"
            + "    \"string\": \"string\",\n"
            + "    \"integer\": 1,\n"
            + "    \"long\": 1000000,\n"
            + "    \"double\": 1.1,\n"
            + "    \"bool\": true,\n"
            + "    \"datetime\": \"2024-01-15T09:30:00Z\",\n"
            + "    \"date\": \"2023-01-15\",\n"
            + "    \"uuid\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "    \"base64\": \"SGVsbG8gd29ybGQh\",\n"
            + "    \"list\": [\n"
            + "      \"list\",\n"
            + "      \"list\"\n"
            + "    ],\n"
            + "    \"set\": [\n"
            + "      \"set\"\n"
            + "    ],\n"
            + "    \"map\": {\n"
            + "      \"1\": \"map\"\n"
            + "    },\n"
            + "    \"bigint\": \"1000000\"\n"
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
}
