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

public class EndpointsHttpMethodsWireTest {
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
    public void testTestGet() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("\"string\""));
        String response = client.endpoints().httpMethods().testGet("id");
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "\"string\"";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        // Enhanced union type validation
        if (actualResponseNode.has("type") || actualResponseNode.has("_type") || actualResponseNode.has("kind")) {
            String discriminator = null;
            if (actualResponseNode.has("type")) discriminator = actualResponseNode.get("type").asText();
            else if (actualResponseNode.has("_type")) discriminator = actualResponseNode.get("_type").asText();
            else if (actualResponseNode.has("kind")) discriminator = actualResponseNode.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        // Enhanced optional/nullable type validation
        if (actualResponseNode.isNull()) {
            // Null values are acceptable for optional types
        } else {
            Assertions.assertTrue(actualResponseNode.isObject() || actualResponseNode.isArray() || actualResponseNode.isValueNode(), "response should be a valid JSON value");
        }
        
        // Enhanced generic/collection type validation
        if (actualResponseNode.isArray()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Array should have valid size");
            // Validate array elements if present
            for (int i = 0; i < actualResponseNode.size(); i++) {
                JsonNode element = actualResponseNode.get(i);
                Assertions.assertNotNull(element, "Array element at index " + i + " should not be null");
            }
        }
        if (actualResponseNode.isObject()) {
            // Validate object structure
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Object should have valid field count");
        }
    }
    @Test
    public void testTestPost() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"string\":\"string\",\"integer\":1,\"long\":1000000,\"double\":1.1,\"bool\":true,\"datetime\":\"2024-01-15T09:30:00Z\",\"date\":\"2023-01-15\",\"uuid\":\"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\"base64\":\"SGVsbG8gd29ybGQh\",\"list\":[\"list\",\"list\"],\"set\":[\"set\"],\"map\":{\"1\":\"map\"},\"bigint\":\"1000000\"}"));
        ObjectWithOptionalField response = client.endpoints().httpMethods().testPost(
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
        String expectedRequestBody = "{\n" +
            "  \"string\": \"string\"\n" +
            "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body structure does not match expected");
        // Enhanced union type validation
        if (actualJson.has("type") || actualJson.has("_type") || actualJson.has("kind")) {
            String discriminator = null;
            if (actualJson.has("type")) discriminator = actualJson.get("type").asText();
            else if (actualJson.has("_type")) discriminator = actualJson.get("_type").asText();
            else if (actualJson.has("kind")) discriminator = actualJson.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        // Enhanced optional/nullable type validation
        if (actualJson.isNull()) {
            // Null values are acceptable for optional types
        } else {
            Assertions.assertTrue(actualJson.isObject() || actualJson.isArray() || actualJson.isValueNode(), "request should be a valid JSON value");
        }
        
        // Enhanced generic/collection type validation
        if (actualJson.isArray()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Array should have valid size");
            // Validate array elements if present
            for (int i = 0; i < actualJson.size(); i++) {
                JsonNode element = actualJson.get(i);
                Assertions.assertNotNull(element, "Array element at index " + i + " should not be null");
            }
        }
        if (actualJson.isObject()) {
            // Validate object structure
            Assertions.assertTrue(actualJson.size() >= 0, "Object should have valid field count");
        }
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"string\": \"string\",\n" +
            "  \"integer\": 1,\n" +
            "  \"long\": 1000000,\n" +
            "  \"double\": 1.1,\n" +
            "  \"bool\": true,\n" +
            "  \"datetime\": \"2024-01-15T09:30:00Z\",\n" +
            "  \"date\": \"2023-01-15\",\n" +
            "  \"uuid\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n" +
            "  \"base64\": \"SGVsbG8gd29ybGQh\",\n" +
            "  \"list\": [\n" +
            "    \"list\",\n" +
            "    \"list\"\n" +
            "  ],\n" +
            "  \"set\": [\n" +
            "    \"set\"\n" +
            "  ],\n" +
            "  \"map\": {\n" +
            "    \"1\": \"map\"\n" +
            "  },\n" +
            "  \"bigint\": \"1000000\"\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        // Enhanced union type validation
        if (actualResponseNode.has("type") || actualResponseNode.has("_type") || actualResponseNode.has("kind")) {
            String discriminator = null;
            if (actualResponseNode.has("type")) discriminator = actualResponseNode.get("type").asText();
            else if (actualResponseNode.has("_type")) discriminator = actualResponseNode.get("_type").asText();
            else if (actualResponseNode.has("kind")) discriminator = actualResponseNode.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        // Enhanced optional/nullable type validation
        if (actualResponseNode.isNull()) {
            // Null values are acceptable for optional types
        } else {
            Assertions.assertTrue(actualResponseNode.isObject() || actualResponseNode.isArray() || actualResponseNode.isValueNode(), "response should be a valid JSON value");
        }
        
        // Enhanced generic/collection type validation
        if (actualResponseNode.isArray()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Array should have valid size");
            // Validate array elements if present
            for (int i = 0; i < actualResponseNode.size(); i++) {
                JsonNode element = actualResponseNode.get(i);
                Assertions.assertNotNull(element, "Array element at index " + i + " should not be null");
            }
        }
        if (actualResponseNode.isObject()) {
            // Validate object structure
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Object should have valid field count");
        }
    }
    @Test
    public void testTestPut() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"string\":\"string\",\"integer\":1,\"long\":1000000,\"double\":1.1,\"bool\":true,\"datetime\":\"2024-01-15T09:30:00Z\",\"date\":\"2023-01-15\",\"uuid\":\"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\"base64\":\"SGVsbG8gd29ybGQh\",\"list\":[\"list\",\"list\"],\"set\":[\"set\"],\"map\":{\"1\":\"map\"},\"bigint\":\"1000000\"}"));
        ObjectWithOptionalField response = client.endpoints().httpMethods().testPut(
            "id",
            ObjectWithRequiredField
                .builder()
                .string("string")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("PUT", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "{\n" +
            "  \"string\": \"string\"\n" +
            "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body structure does not match expected");
        // Enhanced union type validation
        if (actualJson.has("type") || actualJson.has("_type") || actualJson.has("kind")) {
            String discriminator = null;
            if (actualJson.has("type")) discriminator = actualJson.get("type").asText();
            else if (actualJson.has("_type")) discriminator = actualJson.get("_type").asText();
            else if (actualJson.has("kind")) discriminator = actualJson.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        // Enhanced optional/nullable type validation
        if (actualJson.isNull()) {
            // Null values are acceptable for optional types
        } else {
            Assertions.assertTrue(actualJson.isObject() || actualJson.isArray() || actualJson.isValueNode(), "request should be a valid JSON value");
        }
        
        // Enhanced generic/collection type validation
        if (actualJson.isArray()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Array should have valid size");
            // Validate array elements if present
            for (int i = 0; i < actualJson.size(); i++) {
                JsonNode element = actualJson.get(i);
                Assertions.assertNotNull(element, "Array element at index " + i + " should not be null");
            }
        }
        if (actualJson.isObject()) {
            // Validate object structure
            Assertions.assertTrue(actualJson.size() >= 0, "Object should have valid field count");
        }
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"string\": \"string\",\n" +
            "  \"integer\": 1,\n" +
            "  \"long\": 1000000,\n" +
            "  \"double\": 1.1,\n" +
            "  \"bool\": true,\n" +
            "  \"datetime\": \"2024-01-15T09:30:00Z\",\n" +
            "  \"date\": \"2023-01-15\",\n" +
            "  \"uuid\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n" +
            "  \"base64\": \"SGVsbG8gd29ybGQh\",\n" +
            "  \"list\": [\n" +
            "    \"list\",\n" +
            "    \"list\"\n" +
            "  ],\n" +
            "  \"set\": [\n" +
            "    \"set\"\n" +
            "  ],\n" +
            "  \"map\": {\n" +
            "    \"1\": \"map\"\n" +
            "  },\n" +
            "  \"bigint\": \"1000000\"\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        // Enhanced union type validation
        if (actualResponseNode.has("type") || actualResponseNode.has("_type") || actualResponseNode.has("kind")) {
            String discriminator = null;
            if (actualResponseNode.has("type")) discriminator = actualResponseNode.get("type").asText();
            else if (actualResponseNode.has("_type")) discriminator = actualResponseNode.get("_type").asText();
            else if (actualResponseNode.has("kind")) discriminator = actualResponseNode.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        // Enhanced optional/nullable type validation
        if (actualResponseNode.isNull()) {
            // Null values are acceptable for optional types
        } else {
            Assertions.assertTrue(actualResponseNode.isObject() || actualResponseNode.isArray() || actualResponseNode.isValueNode(), "response should be a valid JSON value");
        }
        
        // Enhanced generic/collection type validation
        if (actualResponseNode.isArray()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Array should have valid size");
            // Validate array elements if present
            for (int i = 0; i < actualResponseNode.size(); i++) {
                JsonNode element = actualResponseNode.get(i);
                Assertions.assertNotNull(element, "Array element at index " + i + " should not be null");
            }
        }
        if (actualResponseNode.isObject()) {
            // Validate object structure
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Object should have valid field count");
        }
    }
    @Test
    public void testTestPatch() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"string\":\"string\",\"integer\":1,\"long\":1000000,\"double\":1.1,\"bool\":true,\"datetime\":\"2024-01-15T09:30:00Z\",\"date\":\"2023-01-15\",\"uuid\":\"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\"base64\":\"SGVsbG8gd29ybGQh\",\"list\":[\"list\",\"list\"],\"set\":[\"set\"],\"map\":{\"1\":\"map\"},\"bigint\":\"1000000\"}"));
        ObjectWithOptionalField response = client.endpoints().httpMethods().testPatch(
            "id",
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
        Assertions.assertEquals("PATCH", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "{\n" +
            "  \"string\": \"string\",\n" +
            "  \"integer\": 1,\n" +
            "  \"long\": 1000000,\n" +
            "  \"double\": 1.1,\n" +
            "  \"bool\": true,\n" +
            "  \"datetime\": \"2024-01-15T09:30:00Z\",\n" +
            "  \"date\": \"2023-01-15\",\n" +
            "  \"uuid\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n" +
            "  \"base64\": \"SGVsbG8gd29ybGQh\",\n" +
            "  \"list\": [\n" +
            "    \"list\",\n" +
            "    \"list\"\n" +
            "  ],\n" +
            "  \"set\": [\n" +
            "    \"set\"\n" +
            "  ],\n" +
            "  \"map\": {\n" +
            "    \"1\": \"map\"\n" +
            "  },\n" +
            "  \"bigint\": \"1000000\"\n" +
            "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body structure does not match expected");
        // Enhanced union type validation
        if (actualJson.has("type") || actualJson.has("_type") || actualJson.has("kind")) {
            String discriminator = null;
            if (actualJson.has("type")) discriminator = actualJson.get("type").asText();
            else if (actualJson.has("_type")) discriminator = actualJson.get("_type").asText();
            else if (actualJson.has("kind")) discriminator = actualJson.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        // Enhanced optional/nullable type validation
        if (actualJson.isNull()) {
            // Null values are acceptable for optional types
        } else {
            Assertions.assertTrue(actualJson.isObject() || actualJson.isArray() || actualJson.isValueNode(), "request should be a valid JSON value");
        }
        
        // Enhanced generic/collection type validation
        if (actualJson.isArray()) {
            Assertions.assertTrue(actualJson.size() >= 0, "Array should have valid size");
            // Validate array elements if present
            for (int i = 0; i < actualJson.size(); i++) {
                JsonNode element = actualJson.get(i);
                Assertions.assertNotNull(element, "Array element at index " + i + " should not be null");
            }
        }
        if (actualJson.isObject()) {
            // Validate object structure
            Assertions.assertTrue(actualJson.size() >= 0, "Object should have valid field count");
        }
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"string\": \"string\",\n" +
            "  \"integer\": 1,\n" +
            "  \"long\": 1000000,\n" +
            "  \"double\": 1.1,\n" +
            "  \"bool\": true,\n" +
            "  \"datetime\": \"2024-01-15T09:30:00Z\",\n" +
            "  \"date\": \"2023-01-15\",\n" +
            "  \"uuid\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n" +
            "  \"base64\": \"SGVsbG8gd29ybGQh\",\n" +
            "  \"list\": [\n" +
            "    \"list\",\n" +
            "    \"list\"\n" +
            "  ],\n" +
            "  \"set\": [\n" +
            "    \"set\"\n" +
            "  ],\n" +
            "  \"map\": {\n" +
            "    \"1\": \"map\"\n" +
            "  },\n" +
            "  \"bigint\": \"1000000\"\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        // Enhanced union type validation
        if (actualResponseNode.has("type") || actualResponseNode.has("_type") || actualResponseNode.has("kind")) {
            String discriminator = null;
            if (actualResponseNode.has("type")) discriminator = actualResponseNode.get("type").asText();
            else if (actualResponseNode.has("_type")) discriminator = actualResponseNode.get("_type").asText();
            else if (actualResponseNode.has("kind")) discriminator = actualResponseNode.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        // Enhanced optional/nullable type validation
        if (actualResponseNode.isNull()) {
            // Null values are acceptable for optional types
        } else {
            Assertions.assertTrue(actualResponseNode.isObject() || actualResponseNode.isArray() || actualResponseNode.isValueNode(), "response should be a valid JSON value");
        }
        
        // Enhanced generic/collection type validation
        if (actualResponseNode.isArray()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Array should have valid size");
            // Validate array elements if present
            for (int i = 0; i < actualResponseNode.size(); i++) {
                JsonNode element = actualResponseNode.get(i);
                Assertions.assertNotNull(element, "Array element at index " + i + " should not be null");
            }
        }
        if (actualResponseNode.isObject()) {
            // Validate object structure
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Object should have valid field count");
        }
    }
    @Test
    public void testTestDelete() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("true"));
        Boolean response = client.endpoints().httpMethods().testDelete("id");
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("DELETE", request.getMethod());
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "true";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body structure does not match expected");
        // Enhanced union type validation
        if (actualResponseNode.has("type") || actualResponseNode.has("_type") || actualResponseNode.has("kind")) {
            String discriminator = null;
            if (actualResponseNode.has("type")) discriminator = actualResponseNode.get("type").asText();
            else if (actualResponseNode.has("_type")) discriminator = actualResponseNode.get("_type").asText();
            else if (actualResponseNode.has("kind")) discriminator = actualResponseNode.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }
        
        // Enhanced optional/nullable type validation
        if (actualResponseNode.isNull()) {
            // Null values are acceptable for optional types
        } else {
            Assertions.assertTrue(actualResponseNode.isObject() || actualResponseNode.isArray() || actualResponseNode.isValueNode(), "response should be a valid JSON value");
        }
        
        // Enhanced generic/collection type validation
        if (actualResponseNode.isArray()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Array should have valid size");
            // Validate array elements if present
            for (int i = 0; i < actualResponseNode.size(); i++) {
                JsonNode element = actualResponseNode.get(i);
                Assertions.assertNotNull(element, "Array element at index " + i + " should not be null");
            }
        }
        if (actualResponseNode.isObject()) {
            // Validate object structure
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Object should have valid field count");
        }
    }
}
