package com.seed.trace;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.trace.SeedTraceClient;
import com.seed.trace.core.ObjectMappers;
import com.seed.trace.resources.commons.types.FileInfo;
import com.seed.trace.resources.commons.types.Language;
import com.seed.trace.resources.commons.types.TestCase;
import com.seed.trace.resources.commons.types.TestCaseWithExpectedResult;
import com.seed.trace.resources.commons.types.VariableType;
import com.seed.trace.resources.commons.types.VariableValue;
import com.seed.trace.resources.problem.requests.GetDefaultStarterFilesRequest;
import com.seed.trace.resources.problem.types.CreateProblemRequest;
import com.seed.trace.resources.problem.types.CreateProblemResponse;
import com.seed.trace.resources.problem.types.GetDefaultStarterFilesResponse;
import com.seed.trace.resources.problem.types.ProblemDescription;
import com.seed.trace.resources.problem.types.ProblemDescriptionBoard;
import com.seed.trace.resources.problem.types.ProblemFiles;
import com.seed.trace.resources.problem.types.UpdateProblemResponse;
import com.seed.trace.resources.problem.types.VariableTypeAndName;
import java.util.Arrays;
import java.util.HashMap;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class ProblemWireTest {
    private MockWebServer server;
    private SeedTraceClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;
    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedTraceClient.builder()
            .url(server.url("/").toString())
            .token("test-token")
            .build();
    }
    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }
    @Test
    public void testCreateProblem() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"type\":\"success\",\"value\":\"string\"}"));
        CreateProblemResponse response = client.problem().createProblem(
            CreateProblemRequest
                .builder()
                .problemName("problemName")
                .problemDescription(
                    ProblemDescription
                        .builder()
                        .boards(
                            Arrays.asList(
                                ProblemDescriptionBoard.html(),
                                ProblemDescriptionBoard.html()
                            )
                        )
                        .build()
                )
                .files(
                    new HashMap<Language, ProblemFiles>() {{
                        put(Language.JAVA, ProblemFiles
                            .builder()
                            .solutionFile(
                                FileInfo
                                    .builder()
                                    .filename("filename")
                                    .contents("contents")
                                    .build()
                            )
                            .readOnlyFiles(
                                Arrays.asList(
                                    FileInfo
                                        .builder()
                                        .filename("filename")
                                        .contents("contents")
                                        .build(),
                                    FileInfo
                                        .builder()
                                        .filename("filename")
                                        .contents("contents")
                                        .build()
                                )
                            )
                            .build());
                    }}
                )
                .inputParams(
                    Arrays.asList(
                        VariableTypeAndName
                            .builder()
                            .variableType(
                                VariableType.integerType()
                            )
                            .name("name")
                            .build(),
                        VariableTypeAndName
                            .builder()
                            .variableType(
                                VariableType.integerType()
                            )
                            .name("name")
                            .build()
                    )
                )
                .outputType(
                    VariableType.integerType()
                )
                .testcases(
                    Arrays.asList(
                        TestCaseWithExpectedResult
                            .builder()
                            .testCase(
                                TestCase
                                    .builder()
                                    .id("id")
                                    .params(
                                        Arrays.asList(
                                            VariableValue.integerValue(),
                                            VariableValue.integerValue()
                                        )
                                    )
                                    .build()
                            )
                            .expectedResult(
                                VariableValue.integerValue()
                            )
                            .build(),
                        TestCaseWithExpectedResult
                            .builder()
                            .testCase(
                                TestCase
                                    .builder()
                                    .id("id")
                                    .params(
                                        Arrays.asList(
                                            VariableValue.integerValue(),
                                            VariableValue.integerValue()
                                        )
                                    )
                                    .build()
                            )
                            .expectedResult(
                                VariableValue.integerValue()
                            )
                            .build()
                    )
                )
                .methodName("methodName")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"problemName\": \"problemName\",\n"
            + "  \"problemDescription\": {\n"
            + "    \"boards\": [\n"
            + "      {\n"
            + "        \"type\": \"html\",\n"
            + "        \"value\": \"boards\"\n"
            + "      },\n"
            + "      {\n"
            + "        \"type\": \"html\",\n"
            + "        \"value\": \"boards\"\n"
            + "      }\n"
            + "    ]\n"
            + "  },\n"
            + "  \"files\": {\n"
            + "    \"JAVA\": {\n"
            + "      \"solutionFile\": {\n"
            + "        \"filename\": \"filename\",\n"
            + "        \"contents\": \"contents\"\n"
            + "      },\n"
            + "      \"readOnlyFiles\": [\n"
            + "        {\n"
            + "          \"filename\": \"filename\",\n"
            + "          \"contents\": \"contents\"\n"
            + "        },\n"
            + "        {\n"
            + "          \"filename\": \"filename\",\n"
            + "          \"contents\": \"contents\"\n"
            + "        }\n"
            + "      ]\n"
            + "    }\n"
            + "  },\n"
            + "  \"inputParams\": [\n"
            + "    {\n"
            + "      \"variableType\": {\n"
            + "        \"type\": \"integerType\"\n"
            + "      },\n"
            + "      \"name\": \"name\"\n"
            + "    },\n"
            + "    {\n"
            + "      \"variableType\": {\n"
            + "        \"type\": \"integerType\"\n"
            + "      },\n"
            + "      \"name\": \"name\"\n"
            + "    }\n"
            + "  ],\n"
            + "  \"outputType\": {\n"
            + "    \"type\": \"integerType\"\n"
            + "  },\n"
            + "  \"testcases\": [\n"
            + "    {\n"
            + "      \"testCase\": {\n"
            + "        \"id\": \"id\",\n"
            + "        \"params\": [\n"
            + "          {\n"
            + "            \"type\": \"integerValue\",\n"
            + "            \"value\": 1\n"
            + "          },\n"
            + "          {\n"
            + "            \"type\": \"integerValue\",\n"
            + "            \"value\": 1\n"
            + "          }\n"
            + "        ]\n"
            + "      },\n"
            + "      \"expectedResult\": {\n"
            + "        \"type\": \"integerValue\",\n"
            + "        \"value\": 1\n"
            + "      }\n"
            + "    },\n"
            + "    {\n"
            + "      \"testCase\": {\n"
            + "        \"id\": \"id\",\n"
            + "        \"params\": [\n"
            + "          {\n"
            + "            \"type\": \"integerValue\",\n"
            + "            \"value\": 1\n"
            + "          },\n"
            + "          {\n"
            + "            \"type\": \"integerValue\",\n"
            + "            \"value\": 1\n"
            + "          }\n"
            + "        ]\n"
            + "      },\n"
            + "      \"expectedResult\": {\n"
            + "        \"type\": \"integerValue\",\n"
            + "        \"value\": 1\n"
            + "      }\n"
            + "    }\n"
            + "  ],\n"
            + "  \"methodName\": \"methodName\"\n"
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
            + "  \"type\": \"success\",\n"
            + "  \"value\": \"string\"\n"
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
    public void testUpdateProblem() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"problemVersion\":1}"));
        UpdateProblemResponse response = client.problem().updateProblem(
            "problemId",
            CreateProblemRequest
                .builder()
                .problemName("problemName")
                .problemDescription(
                    ProblemDescription
                        .builder()
                        .boards(
                            Arrays.asList(
                                ProblemDescriptionBoard.html(),
                                ProblemDescriptionBoard.html()
                            )
                        )
                        .build()
                )
                .files(
                    new HashMap<Language, ProblemFiles>() {{
                        put(Language.JAVA, ProblemFiles
                            .builder()
                            .solutionFile(
                                FileInfo
                                    .builder()
                                    .filename("filename")
                                    .contents("contents")
                                    .build()
                            )
                            .readOnlyFiles(
                                Arrays.asList(
                                    FileInfo
                                        .builder()
                                        .filename("filename")
                                        .contents("contents")
                                        .build(),
                                    FileInfo
                                        .builder()
                                        .filename("filename")
                                        .contents("contents")
                                        .build()
                                )
                            )
                            .build());
                    }}
                )
                .inputParams(
                    Arrays.asList(
                        VariableTypeAndName
                            .builder()
                            .variableType(
                                VariableType.integerType()
                            )
                            .name("name")
                            .build(),
                        VariableTypeAndName
                            .builder()
                            .variableType(
                                VariableType.integerType()
                            )
                            .name("name")
                            .build()
                    )
                )
                .outputType(
                    VariableType.integerType()
                )
                .testcases(
                    Arrays.asList(
                        TestCaseWithExpectedResult
                            .builder()
                            .testCase(
                                TestCase
                                    .builder()
                                    .id("id")
                                    .params(
                                        Arrays.asList(
                                            VariableValue.integerValue(),
                                            VariableValue.integerValue()
                                        )
                                    )
                                    .build()
                            )
                            .expectedResult(
                                VariableValue.integerValue()
                            )
                            .build(),
                        TestCaseWithExpectedResult
                            .builder()
                            .testCase(
                                TestCase
                                    .builder()
                                    .id("id")
                                    .params(
                                        Arrays.asList(
                                            VariableValue.integerValue(),
                                            VariableValue.integerValue()
                                        )
                                    )
                                    .build()
                            )
                            .expectedResult(
                                VariableValue.integerValue()
                            )
                            .build()
                    )
                )
                .methodName("methodName")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"problemName\": \"problemName\",\n"
            + "  \"problemDescription\": {\n"
            + "    \"boards\": [\n"
            + "      {\n"
            + "        \"type\": \"html\",\n"
            + "        \"value\": \"boards\"\n"
            + "      },\n"
            + "      {\n"
            + "        \"type\": \"html\",\n"
            + "        \"value\": \"boards\"\n"
            + "      }\n"
            + "    ]\n"
            + "  },\n"
            + "  \"files\": {\n"
            + "    \"JAVA\": {\n"
            + "      \"solutionFile\": {\n"
            + "        \"filename\": \"filename\",\n"
            + "        \"contents\": \"contents\"\n"
            + "      },\n"
            + "      \"readOnlyFiles\": [\n"
            + "        {\n"
            + "          \"filename\": \"filename\",\n"
            + "          \"contents\": \"contents\"\n"
            + "        },\n"
            + "        {\n"
            + "          \"filename\": \"filename\",\n"
            + "          \"contents\": \"contents\"\n"
            + "        }\n"
            + "      ]\n"
            + "    }\n"
            + "  },\n"
            + "  \"inputParams\": [\n"
            + "    {\n"
            + "      \"variableType\": {\n"
            + "        \"type\": \"integerType\"\n"
            + "      },\n"
            + "      \"name\": \"name\"\n"
            + "    },\n"
            + "    {\n"
            + "      \"variableType\": {\n"
            + "        \"type\": \"integerType\"\n"
            + "      },\n"
            + "      \"name\": \"name\"\n"
            + "    }\n"
            + "  ],\n"
            + "  \"outputType\": {\n"
            + "    \"type\": \"integerType\"\n"
            + "  },\n"
            + "  \"testcases\": [\n"
            + "    {\n"
            + "      \"testCase\": {\n"
            + "        \"id\": \"id\",\n"
            + "        \"params\": [\n"
            + "          {\n"
            + "            \"type\": \"integerValue\",\n"
            + "            \"value\": 1\n"
            + "          },\n"
            + "          {\n"
            + "            \"type\": \"integerValue\",\n"
            + "            \"value\": 1\n"
            + "          }\n"
            + "        ]\n"
            + "      },\n"
            + "      \"expectedResult\": {\n"
            + "        \"type\": \"integerValue\",\n"
            + "        \"value\": 1\n"
            + "      }\n"
            + "    },\n"
            + "    {\n"
            + "      \"testCase\": {\n"
            + "        \"id\": \"id\",\n"
            + "        \"params\": [\n"
            + "          {\n"
            + "            \"type\": \"integerValue\",\n"
            + "            \"value\": 1\n"
            + "          },\n"
            + "          {\n"
            + "            \"type\": \"integerValue\",\n"
            + "            \"value\": 1\n"
            + "          }\n"
            + "        ]\n"
            + "      },\n"
            + "      \"expectedResult\": {\n"
            + "        \"type\": \"integerValue\",\n"
            + "        \"value\": 1\n"
            + "      }\n"
            + "    }\n"
            + "  ],\n"
            + "  \"methodName\": \"methodName\"\n"
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
            + "  \"problemVersion\": 1\n"
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
    public void testDeleteProblem() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.problem().deleteProblem("problemId");
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("DELETE", request.getMethod());
    }
    @Test
    public void testGetDefaultStarterFiles() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"files\":{\"JAVA\":{\"solutionFile\":{\"filename\":\"filename\",\"contents\":\"contents\"},\"readOnlyFiles\":[{\"filename\":\"filename\",\"contents\":\"contents\"},{\"filename\":\"filename\",\"contents\":\"contents\"}]}}}"));
        GetDefaultStarterFilesResponse response = client.problem().getDefaultStarterFiles(
            GetDefaultStarterFilesRequest
                .builder()
                .inputParams(
                    Arrays.asList(
                        VariableTypeAndName
                            .builder()
                            .variableType(
                                VariableType.integerType()
                            )
                            .name("name")
                            .build(),
                        VariableTypeAndName
                            .builder()
                            .variableType(
                                VariableType.integerType()
                            )
                            .name("name")
                            .build()
                    )
                )
                .outputType(
                    VariableType.integerType()
                )
                .methodName("methodName")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"inputParams\": [\n"
            + "    {\n"
            + "      \"variableType\": {\n"
            + "        \"type\": \"integerType\"\n"
            + "      },\n"
            + "      \"name\": \"name\"\n"
            + "    },\n"
            + "    {\n"
            + "      \"variableType\": {\n"
            + "        \"type\": \"integerType\"\n"
            + "      },\n"
            + "      \"name\": \"name\"\n"
            + "    }\n"
            + "  ],\n"
            + "  \"outputType\": {\n"
            + "    \"type\": \"integerType\"\n"
            + "  },\n"
            + "  \"methodName\": \"methodName\"\n"
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
            + "  \"files\": {\n"
            + "    \"JAVA\": {\n"
            + "      \"solutionFile\": {\n"
            + "        \"filename\": \"filename\",\n"
            + "        \"contents\": \"contents\"\n"
            + "      },\n"
            + "      \"readOnlyFiles\": [\n"
            + "        {\n"
            + "          \"filename\": \"filename\",\n"
            + "          \"contents\": \"contents\"\n"
            + "        },\n"
            + "        {\n"
            + "          \"filename\": \"filename\",\n"
            + "          \"contents\": \"contents\"\n"
            + "        }\n"
            + "      ]\n"
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
}
