package com.seed.contentTypes;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.contentTypes.SeedContentTypesClient;
import com.seed.contentTypes.core.ObjectMappers;
import com.seed.contentTypes.resources.service.requests.NamedMixedPatchRequest;
import com.seed.contentTypes.resources.service.requests.OptionalMergePatchRequest;
import com.seed.contentTypes.resources.service.requests.PatchComplexRequest;
import com.seed.contentTypes.resources.service.requests.PatchProxyRequest;
import com.seed.contentTypes.resources.service.requests.RegularPatchRequest;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class ServiceWireTest {
    private MockWebServer server;
    private SeedContentTypesClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;
    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedContentTypesClient.builder()
            .url(server.url("/").toString())
            .build();
    }
    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }
    @Test
    public void testPatch() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.service().patch(
            PatchProxyRequest
                .builder()
                .application("application")
                .requireAuth(true)
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("PATCH", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"application\": \"application\",\n"
            + "  \"require_auth\": true\n"
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
    public void testPatchComplex() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.service().patchComplex(
            "id",
            PatchComplexRequest
                .builder()
                .name("name")
                .age(1)
                .active(true)
                .metadata(
                    new HashMap<String, Object>() {{
                        put("metadata", new 
                        HashMap<String, Object>() {{put("key", "value");
                        }});
                    }}
                )
                .tags(
                    Optional.of(
                        Arrays.asList("tags", "tags")
                    )
                )
                .email("email")
                .nickname("nickname")
                .bio("bio")
                .profileImageUrl("profileImageUrl")
                .settings(
                    new HashMap<String, Object>() {{
                        put("settings", new 
                        HashMap<String, Object>() {{put("key", "value");
                        }});
                    }}
                )
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("PATCH", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"name\": \"name\",\n"
            + "  \"age\": 1,\n"
            + "  \"active\": true,\n"
            + "  \"metadata\": {\n"
            + "    \"metadata\": {\n"
            + "      \"key\": \"value\"\n"
            + "    }\n"
            + "  },\n"
            + "  \"tags\": [\n"
            + "    \"tags\",\n"
            + "    \"tags\"\n"
            + "  ],\n"
            + "  \"email\": \"email\",\n"
            + "  \"nickname\": \"nickname\",\n"
            + "  \"bio\": \"bio\",\n"
            + "  \"profileImageUrl\": \"profileImageUrl\",\n"
            + "  \"settings\": {\n"
            + "    \"settings\": {\n"
            + "      \"key\": \"value\"\n"
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
    }
    @Test
    public void testNamedPatchWithMixed() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.service().namedPatchWithMixed(
            "id",
            NamedMixedPatchRequest
                .builder()
                .appId("appId")
                .instructions("instructions")
                .active(true)
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("PATCH", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"appId\": \"appId\",\n"
            + "  \"instructions\": \"instructions\",\n"
            + "  \"active\": true\n"
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
    public void testOptionalMergePatchTest() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.service().optionalMergePatchTest(
            OptionalMergePatchRequest
                .builder()
                .requiredField("requiredField")
                .optionalString("optionalString")
                .optionalInteger(1)
                .optionalBoolean(true)
                .nullableString("nullableString")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("PATCH", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"requiredField\": \"requiredField\",\n"
            + "  \"optionalString\": \"optionalString\",\n"
            + "  \"optionalInteger\": 1,\n"
            + "  \"optionalBoolean\": true,\n"
            + "  \"nullableString\": \"nullableString\"\n"
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
    public void testRegularPatch() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.service().regularPatch(
            "id",
            RegularPatchRequest
                .builder()
                .field1("field1")
                .field2(1)
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("PATCH", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"field1\": \"field1\",\n"
            + "  \"field2\": 1\n"
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
