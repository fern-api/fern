package com.seed.trace;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.trace.SeedTraceClient;
import com.seed.trace.core.ObjectMappers;
import com.seed.trace.resources.admin.requests.StoreTracedTestCaseRequest;
import com.seed.trace.resources.admin.requests.StoreTracedWorkspaceRequest;
import com.seed.trace.resources.commons.types.DebugVariableValue;
import com.seed.trace.resources.commons.types.VariableValue;
import com.seed.trace.resources.submission.types.ActualResult;
import com.seed.trace.resources.submission.types.ExceptionInfo;
import com.seed.trace.resources.submission.types.ExceptionV2;
import com.seed.trace.resources.submission.types.ExpressionLocation;
import com.seed.trace.resources.submission.types.Scope;
import com.seed.trace.resources.submission.types.StackFrame;
import com.seed.trace.resources.submission.types.StackInformation;
import com.seed.trace.resources.submission.types.TestCaseResult;
import com.seed.trace.resources.submission.types.TestCaseResultWithStdout;
import com.seed.trace.resources.submission.types.TestSubmissionStatus;
import com.seed.trace.resources.submission.types.TestSubmissionUpdate;
import com.seed.trace.resources.submission.types.TestSubmissionUpdateInfo;
import com.seed.trace.resources.submission.types.TraceResponse;
import com.seed.trace.resources.submission.types.TraceResponseV2;
import com.seed.trace.resources.submission.types.TracedFile;
import com.seed.trace.resources.submission.types.WorkspaceRunDetails;
import com.seed.trace.resources.submission.types.WorkspaceSubmissionStatus;
import com.seed.trace.resources.submission.types.WorkspaceSubmissionUpdate;
import com.seed.trace.resources.submission.types.WorkspaceSubmissionUpdateInfo;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.UUID;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class AdminWireTest {
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
    public void testUpdateTestSubmissionStatus() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.admin().updateTestSubmissionStatus(
            UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            TestSubmissionStatus.stopped()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"type\": \"stopped\"\n"
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
    public void testSendTestSubmissionUpdate() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.admin().sendTestSubmissionUpdate(
            UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            TestSubmissionUpdate
                .builder()
                .updateTime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .updateInfo(
                    TestSubmissionUpdateInfo.running()
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
            + "  \"updateTime\": \"2024-01-15T09:30:00Z\",\n"
            + "  \"updateInfo\": {\n"
            + "    \"type\": \"running\",\n"
            + "    \"value\": \"QUEUEING_SUBMISSION\"\n"
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
    public void testUpdateWorkspaceSubmissionStatus() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.admin().updateWorkspaceSubmissionStatus(
            UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            WorkspaceSubmissionStatus.stopped()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
            + "{\n"
            + "  \"type\": \"stopped\"\n"
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
    public void testSendWorkspaceSubmissionUpdate() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.admin().sendWorkspaceSubmissionUpdate(
            UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            WorkspaceSubmissionUpdate
                .builder()
                .updateTime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .updateInfo(
                    WorkspaceSubmissionUpdateInfo.running()
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
            + "  \"updateTime\": \"2024-01-15T09:30:00Z\",\n"
            + "  \"updateInfo\": {\n"
            + "    \"type\": \"running\",\n"
            + "    \"value\": \"QUEUEING_SUBMISSION\"\n"
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
    public void testStoreTracedTestCase() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.admin().storeTracedTestCase(
            UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            "testCaseId",
            StoreTracedTestCaseRequest
                .builder()
                .result(
                    TestCaseResultWithStdout
                        .builder()
                        .result(
                            TestCaseResult
                                .builder()
                                .expectedResult(
                                    VariableValue.integerValue()
                                )
                                .actualResult(
                                    ActualResult.value(
                                        VariableValue.integerValue()
                                    )
                                )
                                .passed(true)
                                .build()
                        )
                        .stdout("stdout")
                        .build()
                )
                .traceResponses(
                    Arrays.asList(
                        TraceResponse
                            .builder()
                            .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                            .lineNumber(1)
                            .stack(
                                StackInformation
                                    .builder()
                                    .numStackFrames(1)
                                    .topStackFrame(
                                        StackFrame
                                            .builder()
                                            .methodName("methodName")
                                            .lineNumber(1)
                                            .scopes(
                                                Arrays.asList(
                                                    Scope
                                                        .builder()
                                                        .variables(
                                                            new HashMap<String, DebugVariableValue>() {{
                                                                put("variables", DebugVariableValue.integerValue());
                                                            }}
                                                        )
                                                        .build(),
                                                    Scope
                                                        .builder()
                                                        .variables(
                                                            new HashMap<String, DebugVariableValue>() {{
                                                                put("variables", DebugVariableValue.integerValue());
                                                            }}
                                                        )
                                                        .build()
                                                )
                                            )
                                            .build()
                                    )
                                    .build()
                            )
                            .returnValue(
                                DebugVariableValue.integerValue()
                            )
                            .expressionLocation(
                                ExpressionLocation
                                    .builder()
                                    .start(1)
                                    .offset(1)
                                    .build()
                            )
                            .stdout("stdout")
                            .build(),
                        TraceResponse
                            .builder()
                            .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                            .lineNumber(1)
                            .stack(
                                StackInformation
                                    .builder()
                                    .numStackFrames(1)
                                    .topStackFrame(
                                        StackFrame
                                            .builder()
                                            .methodName("methodName")
                                            .lineNumber(1)
                                            .scopes(
                                                Arrays.asList(
                                                    Scope
                                                        .builder()
                                                        .variables(
                                                            new HashMap<String, DebugVariableValue>() {{
                                                                put("variables", DebugVariableValue.integerValue());
                                                            }}
                                                        )
                                                        .build(),
                                                    Scope
                                                        .builder()
                                                        .variables(
                                                            new HashMap<String, DebugVariableValue>() {{
                                                                put("variables", DebugVariableValue.integerValue());
                                                            }}
                                                        )
                                                        .build()
                                                )
                                            )
                                            .build()
                                    )
                                    .build()
                            )
                            .returnValue(
                                DebugVariableValue.integerValue()
                            )
                            .expressionLocation(
                                ExpressionLocation
                                    .builder()
                                    .start(1)
                                    .offset(1)
                                    .build()
                            )
                            .stdout("stdout")
                            .build()
                    )
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
            + "  \"result\": {\n"
            + "    \"result\": {\n"
            + "      \"expectedResult\": {\n"
            + "        \"type\": \"integerValue\",\n"
            + "        \"value\": 1\n"
            + "      },\n"
            + "      \"actualResult\": {\n"
            + "        \"type\": \"value\",\n"
            + "        \"value\": {\n"
            + "          \"type\": \"integerValue\",\n"
            + "          \"value\": 1\n"
            + "        }\n"
            + "      },\n"
            + "      \"passed\": true\n"
            + "    },\n"
            + "    \"stdout\": \"stdout\"\n"
            + "  },\n"
            + "  \"traceResponses\": [\n"
            + "    {\n"
            + "      \"submissionId\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "      \"lineNumber\": 1,\n"
            + "      \"returnValue\": {\n"
            + "        \"type\": \"integerValue\",\n"
            + "        \"value\": 1\n"
            + "      },\n"
            + "      \"expressionLocation\": {\n"
            + "        \"start\": 1,\n"
            + "        \"offset\": 1\n"
            + "      },\n"
            + "      \"stack\": {\n"
            + "        \"numStackFrames\": 1,\n"
            + "        \"topStackFrame\": {\n"
            + "          \"methodName\": \"methodName\",\n"
            + "          \"lineNumber\": 1,\n"
            + "          \"scopes\": [\n"
            + "            {\n"
            + "              \"variables\": {\n"
            + "                \"variables\": {\n"
            + "                  \"type\": \"integerValue\",\n"
            + "                  \"value\": 1\n"
            + "                }\n"
            + "              }\n"
            + "            },\n"
            + "            {\n"
            + "              \"variables\": {\n"
            + "                \"variables\": {\n"
            + "                  \"type\": \"integerValue\",\n"
            + "                  \"value\": 1\n"
            + "                }\n"
            + "              }\n"
            + "            }\n"
            + "          ]\n"
            + "        }\n"
            + "      },\n"
            + "      \"stdout\": \"stdout\"\n"
            + "    },\n"
            + "    {\n"
            + "      \"submissionId\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "      \"lineNumber\": 1,\n"
            + "      \"returnValue\": {\n"
            + "        \"type\": \"integerValue\",\n"
            + "        \"value\": 1\n"
            + "      },\n"
            + "      \"expressionLocation\": {\n"
            + "        \"start\": 1,\n"
            + "        \"offset\": 1\n"
            + "      },\n"
            + "      \"stack\": {\n"
            + "        \"numStackFrames\": 1,\n"
            + "        \"topStackFrame\": {\n"
            + "          \"methodName\": \"methodName\",\n"
            + "          \"lineNumber\": 1,\n"
            + "          \"scopes\": [\n"
            + "            {\n"
            + "              \"variables\": {\n"
            + "                \"variables\": {\n"
            + "                  \"type\": \"integerValue\",\n"
            + "                  \"value\": 1\n"
            + "                }\n"
            + "              }\n"
            + "            },\n"
            + "            {\n"
            + "              \"variables\": {\n"
            + "                \"variables\": {\n"
            + "                  \"type\": \"integerValue\",\n"
            + "                  \"value\": 1\n"
            + "                }\n"
            + "              }\n"
            + "            }\n"
            + "          ]\n"
            + "        }\n"
            + "      },\n"
            + "      \"stdout\": \"stdout\"\n"
            + "    }\n"
            + "  ]\n"
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
    public void testStoreTracedTestCaseV2() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.admin().storeTracedTestCaseV2(
            UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            "testCaseId",
            Arrays.asList(
                TraceResponseV2
                    .builder()
                    .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                    .lineNumber(1)
                    .file(
                        TracedFile
                            .builder()
                            .filename("filename")
                            .directory("directory")
                            .build()
                    )
                    .stack(
                        StackInformation
                            .builder()
                            .numStackFrames(1)
                            .topStackFrame(
                                StackFrame
                                    .builder()
                                    .methodName("methodName")
                                    .lineNumber(1)
                                    .scopes(
                                        Arrays.asList(
                                            Scope
                                                .builder()
                                                .variables(
                                                    new HashMap<String, DebugVariableValue>() {{
                                                        put("variables", DebugVariableValue.integerValue());
                                                    }}
                                                )
                                                .build(),
                                            Scope
                                                .builder()
                                                .variables(
                                                    new HashMap<String, DebugVariableValue>() {{
                                                        put("variables", DebugVariableValue.integerValue());
                                                    }}
                                                )
                                                .build()
                                        )
                                    )
                                    .build()
                            )
                            .build()
                    )
                    .returnValue(
                        DebugVariableValue.integerValue()
                    )
                    .expressionLocation(
                        ExpressionLocation
                            .builder()
                            .start(1)
                            .offset(1)
                            .build()
                    )
                    .stdout("stdout")
                    .build(),
                TraceResponseV2
                    .builder()
                    .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                    .lineNumber(1)
                    .file(
                        TracedFile
                            .builder()
                            .filename("filename")
                            .directory("directory")
                            .build()
                    )
                    .stack(
                        StackInformation
                            .builder()
                            .numStackFrames(1)
                            .topStackFrame(
                                StackFrame
                                    .builder()
                                    .methodName("methodName")
                                    .lineNumber(1)
                                    .scopes(
                                        Arrays.asList(
                                            Scope
                                                .builder()
                                                .variables(
                                                    new HashMap<String, DebugVariableValue>() {{
                                                        put("variables", DebugVariableValue.integerValue());
                                                    }}
                                                )
                                                .build(),
                                            Scope
                                                .builder()
                                                .variables(
                                                    new HashMap<String, DebugVariableValue>() {{
                                                        put("variables", DebugVariableValue.integerValue());
                                                    }}
                                                )
                                                .build()
                                        )
                                    )
                                    .build()
                            )
                            .build()
                    )
                    .returnValue(
                        DebugVariableValue.integerValue()
                    )
                    .expressionLocation(
                        ExpressionLocation
                            .builder()
                            .start(1)
                            .offset(1)
                            .build()
                    )
                    .stdout("stdout")
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
            + "    \"submissionId\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "    \"lineNumber\": 1,\n"
            + "    \"file\": {\n"
            + "      \"filename\": \"filename\",\n"
            + "      \"directory\": \"directory\"\n"
            + "    },\n"
            + "    \"returnValue\": {\n"
            + "      \"type\": \"integerValue\",\n"
            + "      \"value\": 1\n"
            + "    },\n"
            + "    \"expressionLocation\": {\n"
            + "      \"start\": 1,\n"
            + "      \"offset\": 1\n"
            + "    },\n"
            + "    \"stack\": {\n"
            + "      \"numStackFrames\": 1,\n"
            + "      \"topStackFrame\": {\n"
            + "        \"methodName\": \"methodName\",\n"
            + "        \"lineNumber\": 1,\n"
            + "        \"scopes\": [\n"
            + "          {\n"
            + "            \"variables\": {\n"
            + "              \"variables\": {\n"
            + "                \"type\": \"integerValue\",\n"
            + "                \"value\": 1\n"
            + "              }\n"
            + "            }\n"
            + "          },\n"
            + "          {\n"
            + "            \"variables\": {\n"
            + "              \"variables\": {\n"
            + "                \"type\": \"integerValue\",\n"
            + "                \"value\": 1\n"
            + "              }\n"
            + "            }\n"
            + "          }\n"
            + "        ]\n"
            + "      }\n"
            + "    },\n"
            + "    \"stdout\": \"stdout\"\n"
            + "  },\n"
            + "  {\n"
            + "    \"submissionId\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "    \"lineNumber\": 1,\n"
            + "    \"file\": {\n"
            + "      \"filename\": \"filename\",\n"
            + "      \"directory\": \"directory\"\n"
            + "    },\n"
            + "    \"returnValue\": {\n"
            + "      \"type\": \"integerValue\",\n"
            + "      \"value\": 1\n"
            + "    },\n"
            + "    \"expressionLocation\": {\n"
            + "      \"start\": 1,\n"
            + "      \"offset\": 1\n"
            + "    },\n"
            + "    \"stack\": {\n"
            + "      \"numStackFrames\": 1,\n"
            + "      \"topStackFrame\": {\n"
            + "        \"methodName\": \"methodName\",\n"
            + "        \"lineNumber\": 1,\n"
            + "        \"scopes\": [\n"
            + "          {\n"
            + "            \"variables\": {\n"
            + "              \"variables\": {\n"
            + "                \"type\": \"integerValue\",\n"
            + "                \"value\": 1\n"
            + "              }\n"
            + "            }\n"
            + "          },\n"
            + "          {\n"
            + "            \"variables\": {\n"
            + "              \"variables\": {\n"
            + "                \"type\": \"integerValue\",\n"
            + "                \"value\": 1\n"
            + "              }\n"
            + "            }\n"
            + "          }\n"
            + "        ]\n"
            + "      }\n"
            + "    },\n"
            + "    \"stdout\": \"stdout\"\n"
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
    }
    @Test
    public void testStoreTracedWorkspace() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.admin().storeTracedWorkspace(
            UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            StoreTracedWorkspaceRequest
                .builder()
                .workspaceRunDetails(
                    WorkspaceRunDetails
                        .builder()
                        .stdout("stdout")
                        .exceptionV2(
                            ExceptionV2.generic(
                                ExceptionInfo
                                    .builder()
                                    .exceptionType("exceptionType")
                                    .exceptionMessage("exceptionMessage")
                                    .exceptionStacktrace("exceptionStacktrace")
                                    .build()
                            )
                        )
                        .exception(
                            ExceptionInfo
                                .builder()
                                .exceptionType("exceptionType")
                                .exceptionMessage("exceptionMessage")
                                .exceptionStacktrace("exceptionStacktrace")
                                .build()
                        )
                        .build()
                )
                .traceResponses(
                    Arrays.asList(
                        TraceResponse
                            .builder()
                            .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                            .lineNumber(1)
                            .stack(
                                StackInformation
                                    .builder()
                                    .numStackFrames(1)
                                    .topStackFrame(
                                        StackFrame
                                            .builder()
                                            .methodName("methodName")
                                            .lineNumber(1)
                                            .scopes(
                                                Arrays.asList(
                                                    Scope
                                                        .builder()
                                                        .variables(
                                                            new HashMap<String, DebugVariableValue>() {{
                                                                put("variables", DebugVariableValue.integerValue());
                                                            }}
                                                        )
                                                        .build(),
                                                    Scope
                                                        .builder()
                                                        .variables(
                                                            new HashMap<String, DebugVariableValue>() {{
                                                                put("variables", DebugVariableValue.integerValue());
                                                            }}
                                                        )
                                                        .build()
                                                )
                                            )
                                            .build()
                                    )
                                    .build()
                            )
                            .returnValue(
                                DebugVariableValue.integerValue()
                            )
                            .expressionLocation(
                                ExpressionLocation
                                    .builder()
                                    .start(1)
                                    .offset(1)
                                    .build()
                            )
                            .stdout("stdout")
                            .build(),
                        TraceResponse
                            .builder()
                            .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                            .lineNumber(1)
                            .stack(
                                StackInformation
                                    .builder()
                                    .numStackFrames(1)
                                    .topStackFrame(
                                        StackFrame
                                            .builder()
                                            .methodName("methodName")
                                            .lineNumber(1)
                                            .scopes(
                                                Arrays.asList(
                                                    Scope
                                                        .builder()
                                                        .variables(
                                                            new HashMap<String, DebugVariableValue>() {{
                                                                put("variables", DebugVariableValue.integerValue());
                                                            }}
                                                        )
                                                        .build(),
                                                    Scope
                                                        .builder()
                                                        .variables(
                                                            new HashMap<String, DebugVariableValue>() {{
                                                                put("variables", DebugVariableValue.integerValue());
                                                            }}
                                                        )
                                                        .build()
                                                )
                                            )
                                            .build()
                                    )
                                    .build()
                            )
                            .returnValue(
                                DebugVariableValue.integerValue()
                            )
                            .expressionLocation(
                                ExpressionLocation
                                    .builder()
                                    .start(1)
                                    .offset(1)
                                    .build()
                            )
                            .stdout("stdout")
                            .build()
                    )
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
            + "  \"workspaceRunDetails\": {\n"
            + "    \"exceptionV2\": {\n"
            + "      \"type\": \"generic\",\n"
            + "      \"exceptionType\": \"exceptionType\",\n"
            + "      \"exceptionMessage\": \"exceptionMessage\",\n"
            + "      \"exceptionStacktrace\": \"exceptionStacktrace\"\n"
            + "    },\n"
            + "    \"exception\": {\n"
            + "      \"exceptionType\": \"exceptionType\",\n"
            + "      \"exceptionMessage\": \"exceptionMessage\",\n"
            + "      \"exceptionStacktrace\": \"exceptionStacktrace\"\n"
            + "    },\n"
            + "    \"stdout\": \"stdout\"\n"
            + "  },\n"
            + "  \"traceResponses\": [\n"
            + "    {\n"
            + "      \"submissionId\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "      \"lineNumber\": 1,\n"
            + "      \"returnValue\": {\n"
            + "        \"type\": \"integerValue\",\n"
            + "        \"value\": 1\n"
            + "      },\n"
            + "      \"expressionLocation\": {\n"
            + "        \"start\": 1,\n"
            + "        \"offset\": 1\n"
            + "      },\n"
            + "      \"stack\": {\n"
            + "        \"numStackFrames\": 1,\n"
            + "        \"topStackFrame\": {\n"
            + "          \"methodName\": \"methodName\",\n"
            + "          \"lineNumber\": 1,\n"
            + "          \"scopes\": [\n"
            + "            {\n"
            + "              \"variables\": {\n"
            + "                \"variables\": {\n"
            + "                  \"type\": \"integerValue\",\n"
            + "                  \"value\": 1\n"
            + "                }\n"
            + "              }\n"
            + "            },\n"
            + "            {\n"
            + "              \"variables\": {\n"
            + "                \"variables\": {\n"
            + "                  \"type\": \"integerValue\",\n"
            + "                  \"value\": 1\n"
            + "                }\n"
            + "              }\n"
            + "            }\n"
            + "          ]\n"
            + "        }\n"
            + "      },\n"
            + "      \"stdout\": \"stdout\"\n"
            + "    },\n"
            + "    {\n"
            + "      \"submissionId\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "      \"lineNumber\": 1,\n"
            + "      \"returnValue\": {\n"
            + "        \"type\": \"integerValue\",\n"
            + "        \"value\": 1\n"
            + "      },\n"
            + "      \"expressionLocation\": {\n"
            + "        \"start\": 1,\n"
            + "        \"offset\": 1\n"
            + "      },\n"
            + "      \"stack\": {\n"
            + "        \"numStackFrames\": 1,\n"
            + "        \"topStackFrame\": {\n"
            + "          \"methodName\": \"methodName\",\n"
            + "          \"lineNumber\": 1,\n"
            + "          \"scopes\": [\n"
            + "            {\n"
            + "              \"variables\": {\n"
            + "                \"variables\": {\n"
            + "                  \"type\": \"integerValue\",\n"
            + "                  \"value\": 1\n"
            + "                }\n"
            + "              }\n"
            + "            },\n"
            + "            {\n"
            + "              \"variables\": {\n"
            + "                \"variables\": {\n"
            + "                  \"type\": \"integerValue\",\n"
            + "                  \"value\": 1\n"
            + "                }\n"
            + "              }\n"
            + "            }\n"
            + "          ]\n"
            + "        }\n"
            + "      },\n"
            + "      \"stdout\": \"stdout\"\n"
            + "    }\n"
            + "  ]\n"
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
    public void testStoreTracedWorkspaceV2() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.admin().storeTracedWorkspaceV2(
            UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            Arrays.asList(
                TraceResponseV2
                    .builder()
                    .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                    .lineNumber(1)
                    .file(
                        TracedFile
                            .builder()
                            .filename("filename")
                            .directory("directory")
                            .build()
                    )
                    .stack(
                        StackInformation
                            .builder()
                            .numStackFrames(1)
                            .topStackFrame(
                                StackFrame
                                    .builder()
                                    .methodName("methodName")
                                    .lineNumber(1)
                                    .scopes(
                                        Arrays.asList(
                                            Scope
                                                .builder()
                                                .variables(
                                                    new HashMap<String, DebugVariableValue>() {{
                                                        put("variables", DebugVariableValue.integerValue());
                                                    }}
                                                )
                                                .build(),
                                            Scope
                                                .builder()
                                                .variables(
                                                    new HashMap<String, DebugVariableValue>() {{
                                                        put("variables", DebugVariableValue.integerValue());
                                                    }}
                                                )
                                                .build()
                                        )
                                    )
                                    .build()
                            )
                            .build()
                    )
                    .returnValue(
                        DebugVariableValue.integerValue()
                    )
                    .expressionLocation(
                        ExpressionLocation
                            .builder()
                            .start(1)
                            .offset(1)
                            .build()
                    )
                    .stdout("stdout")
                    .build(),
                TraceResponseV2
                    .builder()
                    .submissionId(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                    .lineNumber(1)
                    .file(
                        TracedFile
                            .builder()
                            .filename("filename")
                            .directory("directory")
                            .build()
                    )
                    .stack(
                        StackInformation
                            .builder()
                            .numStackFrames(1)
                            .topStackFrame(
                                StackFrame
                                    .builder()
                                    .methodName("methodName")
                                    .lineNumber(1)
                                    .scopes(
                                        Arrays.asList(
                                            Scope
                                                .builder()
                                                .variables(
                                                    new HashMap<String, DebugVariableValue>() {{
                                                        put("variables", DebugVariableValue.integerValue());
                                                    }}
                                                )
                                                .build(),
                                            Scope
                                                .builder()
                                                .variables(
                                                    new HashMap<String, DebugVariableValue>() {{
                                                        put("variables", DebugVariableValue.integerValue());
                                                    }}
                                                )
                                                .build()
                                        )
                                    )
                                    .build()
                            )
                            .build()
                    )
                    .returnValue(
                        DebugVariableValue.integerValue()
                    )
                    .expressionLocation(
                        ExpressionLocation
                            .builder()
                            .start(1)
                            .offset(1)
                            .build()
                    )
                    .stdout("stdout")
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
            + "    \"submissionId\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "    \"lineNumber\": 1,\n"
            + "    \"file\": {\n"
            + "      \"filename\": \"filename\",\n"
            + "      \"directory\": \"directory\"\n"
            + "    },\n"
            + "    \"returnValue\": {\n"
            + "      \"type\": \"integerValue\",\n"
            + "      \"value\": 1\n"
            + "    },\n"
            + "    \"expressionLocation\": {\n"
            + "      \"start\": 1,\n"
            + "      \"offset\": 1\n"
            + "    },\n"
            + "    \"stack\": {\n"
            + "      \"numStackFrames\": 1,\n"
            + "      \"topStackFrame\": {\n"
            + "        \"methodName\": \"methodName\",\n"
            + "        \"lineNumber\": 1,\n"
            + "        \"scopes\": [\n"
            + "          {\n"
            + "            \"variables\": {\n"
            + "              \"variables\": {\n"
            + "                \"type\": \"integerValue\",\n"
            + "                \"value\": 1\n"
            + "              }\n"
            + "            }\n"
            + "          },\n"
            + "          {\n"
            + "            \"variables\": {\n"
            + "              \"variables\": {\n"
            + "                \"type\": \"integerValue\",\n"
            + "                \"value\": 1\n"
            + "              }\n"
            + "            }\n"
            + "          }\n"
            + "        ]\n"
            + "      }\n"
            + "    },\n"
            + "    \"stdout\": \"stdout\"\n"
            + "  },\n"
            + "  {\n"
            + "    \"submissionId\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
            + "    \"lineNumber\": 1,\n"
            + "    \"file\": {\n"
            + "      \"filename\": \"filename\",\n"
            + "      \"directory\": \"directory\"\n"
            + "    },\n"
            + "    \"returnValue\": {\n"
            + "      \"type\": \"integerValue\",\n"
            + "      \"value\": 1\n"
            + "    },\n"
            + "    \"expressionLocation\": {\n"
            + "      \"start\": 1,\n"
            + "      \"offset\": 1\n"
            + "    },\n"
            + "    \"stack\": {\n"
            + "      \"numStackFrames\": 1,\n"
            + "      \"topStackFrame\": {\n"
            + "        \"methodName\": \"methodName\",\n"
            + "        \"lineNumber\": 1,\n"
            + "        \"scopes\": [\n"
            + "          {\n"
            + "            \"variables\": {\n"
            + "              \"variables\": {\n"
            + "                \"type\": \"integerValue\",\n"
            + "                \"value\": 1\n"
            + "              }\n"
            + "            }\n"
            + "          },\n"
            + "          {\n"
            + "            \"variables\": {\n"
            + "              \"variables\": {\n"
            + "                \"type\": \"integerValue\",\n"
            + "                \"value\": 1\n"
            + "              }\n"
            + "            }\n"
            + "          }\n"
            + "        ]\n"
            + "      }\n"
            + "    },\n"
            + "    \"stdout\": \"stdout\"\n"
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
    }
}
