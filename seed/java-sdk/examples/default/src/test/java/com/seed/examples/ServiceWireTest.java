package com.seed.examples;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.examples.core.ObjectMappers;
import com.seed.examples.resources.commons.types.types.Data;
import com.seed.examples.resources.commons.types.types.EventInfo;
import com.seed.examples.resources.commons.types.types.Metadata;
import com.seed.examples.resources.service.requests.GetMetadataRequest;
import com.seed.examples.resources.types.types.Actor;
import com.seed.examples.resources.types.types.BigEntity;
import com.seed.examples.resources.types.types.CastMember;
import com.seed.examples.resources.types.types.Directory;
import com.seed.examples.resources.types.types.Entity;
import com.seed.examples.resources.types.types.Exception;
import com.seed.examples.resources.types.types.ExceptionInfo;
import com.seed.examples.resources.types.types.ExtendedMovie;
import com.seed.examples.resources.types.types.File;
import com.seed.examples.resources.types.types.Metadata;
import com.seed.examples.resources.types.types.Migration;
import com.seed.examples.resources.types.types.MigrationStatus;
import com.seed.examples.resources.types.types.Moment;
import com.seed.examples.resources.types.types.Movie;
import com.seed.examples.resources.types.types.Node;
import com.seed.examples.resources.types.types.Response;
import com.seed.examples.resources.types.types.Test;
import com.seed.examples.resources.types.types.Tree;
import com.seed.examples.types.BasicType;
import com.seed.examples.types.Type;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;
import java.util.UUID;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class ServiceWireTest {
    private MockWebServer server;
    private SeedExamplesClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;

    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedExamplesClient.builder()
                .url(server.url("/").toString())
                .token("test-token")
                .build();
    }

    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }

    @Test
    public void testGetMovie() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"id\":\"movie-c06a4ad7\",\"prequel\":\"movie-cv9b914f\",\"title\":\"The Boy and the Heron\",\"from\":\"Hayao Miyazaki\",\"rating\":8,\"type\":\"movie\",\"tag\":\"tag-wf9as23d\",\"metadata\":{\"actors\":[\"Christian Bale\",\"Florence Pugh\",\"Willem Dafoe\"],\"releaseDate\":\"2023-12-08\",\"ratings\":{\"rottenTomatoes\":97,\"imdb\":7.6}},\"revenue\":1000000}"));
        Movie response = client.service().getMovie("movie-c06a4ad7");
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"id\": \"movie-c06a4ad7\",\n"
                + "  \"prequel\": \"movie-cv9b914f\",\n"
                + "  \"title\": \"The Boy and the Heron\",\n"
                + "  \"from\": \"Hayao Miyazaki\",\n"
                + "  \"rating\": 8,\n"
                + "  \"type\": \"movie\",\n"
                + "  \"tag\": \"tag-wf9as23d\",\n"
                + "  \"metadata\": {\n"
                + "    \"actors\": [\n"
                + "      \"Christian Bale\",\n"
                + "      \"Florence Pugh\",\n"
                + "      \"Willem Dafoe\"\n"
                + "    ],\n"
                + "    \"releaseDate\": \"2023-12-08\",\n"
                + "    \"ratings\": {\n"
                + "      \"rottenTomatoes\": 97,\n"
                + "      \"imdb\": 7.6\n"
                + "    }\n"
                + "  },\n"
                + "  \"revenue\": 1000000\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertTrue(
                jsonEquals(expectedResponseNode, actualResponseNode),
                "Response body structure does not match expected");
        if (actualResponseNode.has("type") || actualResponseNode.has("_type") || actualResponseNode.has("kind")) {
            String discriminator = null;
            if (actualResponseNode.has("type"))
                discriminator = actualResponseNode.get("type").asText();
            else if (actualResponseNode.has("_type"))
                discriminator = actualResponseNode.get("_type").asText();
            else if (actualResponseNode.has("kind"))
                discriminator = actualResponseNode.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }

        if (!actualResponseNode.isNull()) {
            Assertions.assertTrue(
                    actualResponseNode.isObject() || actualResponseNode.isArray() || actualResponseNode.isValueNode(),
                    "response should be a valid JSON value");
        }

        if (actualResponseNode.isArray()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Array should have valid size");
        }
        if (actualResponseNode.isObject()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Object should have valid field count");
        }
    }

    @Test
    public void testCreateMovie() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("\"movie-c06a4ad7\""));
        String response = client.service()
                .createMovie(Movie.builder()
                        .id("movie-c06a4ad7")
                        .title("The Boy and the Heron")
                        .from("Hayao Miyazaki")
                        .rating(8.0)
                        .tag("tag-wf9as23d")
                        .revenue(1000000L)
                        .prequel("movie-cv9b914f")
                        .metadata(new HashMap<String, Object>() {
                            {
                                put(
                                        "actors",
                                        new ArrayList<Object>(
                                                Arrays.asList("Christian Bale", "Florence Pugh", "Willem Dafoe")));
                                put("releaseDate", "2023-12-08");
                                put("ratings", new HashMap<String, Object>() {
                                    {
                                        put("rottenTomatoes", 97);
                                        put("imdb", 7.6);
                                    }
                                });
                            }
                        })
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
                + "{\n"
                + "  \"id\": \"movie-c06a4ad7\",\n"
                + "  \"prequel\": \"movie-cv9b914f\",\n"
                + "  \"title\": \"The Boy and the Heron\",\n"
                + "  \"from\": \"Hayao Miyazaki\",\n"
                + "  \"rating\": 8,\n"
                + "  \"type\": \"movie\",\n"
                + "  \"tag\": \"tag-wf9as23d\",\n"
                + "  \"metadata\": {\n"
                + "    \"actors\": [\n"
                + "      \"Christian Bale\",\n"
                + "      \"Florence Pugh\",\n"
                + "      \"Willem Dafoe\"\n"
                + "    ],\n"
                + "    \"releaseDate\": \"2023-12-08\",\n"
                + "    \"ratings\": {\n"
                + "      \"rottenTomatoes\": 97,\n"
                + "      \"imdb\": 7.6\n"
                + "    }\n"
                + "  },\n"
                + "  \"revenue\": 1000000\n"
                + "}";
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

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "" + "\"movie-c06a4ad7\"";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertTrue(
                jsonEquals(expectedResponseNode, actualResponseNode),
                "Response body structure does not match expected");
        if (actualResponseNode.has("type") || actualResponseNode.has("_type") || actualResponseNode.has("kind")) {
            String discriminator = null;
            if (actualResponseNode.has("type"))
                discriminator = actualResponseNode.get("type").asText();
            else if (actualResponseNode.has("_type"))
                discriminator = actualResponseNode.get("_type").asText();
            else if (actualResponseNode.has("kind"))
                discriminator = actualResponseNode.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }

        if (!actualResponseNode.isNull()) {
            Assertions.assertTrue(
                    actualResponseNode.isObject() || actualResponseNode.isArray() || actualResponseNode.isValueNode(),
                    "response should be a valid JSON value");
        }

        if (actualResponseNode.isArray()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Array should have valid size");
        }
        if (actualResponseNode.isObject()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Object should have valid field count");
        }
    }

    @Test
    public void testGetMetadata() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"type\":\"html\",\"extra\":{\"version\":\"0.0.1\",\"tenancy\":\"test\"},\"tags\":[\"development\",\"public\"],\"value\":\"<head>...</head>\"}"));
        Metadata response = client.service()
                .getMetadata(GetMetadataRequest.builder()
                        .xApiVersion("0.0.1")
                        .tag(Arrays.asList("development"))
                        .shallow(false)
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());

        // Validate headers
        Assertions.assertEquals(
                "0.0.1", request.getHeader("X-API-Version"), "Header 'X-API-Version' should match expected value");

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"type\": \"html\",\n"
                + "  \"extra\": {\n"
                + "    \"version\": \"0.0.1\",\n"
                + "    \"tenancy\": \"test\"\n"
                + "  },\n"
                + "  \"tags\": [\n"
                + "    \"development\",\n"
                + "    \"public\"\n"
                + "  ],\n"
                + "  \"value\": \"<head>...</head>\"\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertTrue(
                jsonEquals(expectedResponseNode, actualResponseNode),
                "Response body structure does not match expected");
        if (actualResponseNode.has("type") || actualResponseNode.has("_type") || actualResponseNode.has("kind")) {
            String discriminator = null;
            if (actualResponseNode.has("type"))
                discriminator = actualResponseNode.get("type").asText();
            else if (actualResponseNode.has("_type"))
                discriminator = actualResponseNode.get("_type").asText();
            else if (actualResponseNode.has("kind"))
                discriminator = actualResponseNode.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }

        if (!actualResponseNode.isNull()) {
            Assertions.assertTrue(
                    actualResponseNode.isObject() || actualResponseNode.isArray() || actualResponseNode.isValueNode(),
                    "response should be a valid JSON value");
        }

        if (actualResponseNode.isArray()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Array should have valid size");
        }
        if (actualResponseNode.isObject()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Object should have valid field count");
        }
    }

    @Test
    public void testCreateBigEntity() throws Exception {
        server.enqueue(
                new MockResponse()
                        .setResponseCode(200)
                        .setBody(
                                "{\"response\":{\"key\":\"value\"},\"identifiers\":[{\"type\":\"primitive\",\"value\":\"value\",\"label\":\"label\"},{\"type\":\"primitive\",\"value\":\"value\",\"label\":\"label\"}]}"));
        Response response = client.service()
                .createBigEntity(BigEntity.builder()
                        .castMember(CastMember.of(
                                Actor.builder().name("name").id("id").build()))
                        .extendedMovie(ExtendedMovie.builder()
                                .id("id")
                                .title("title")
                                .from("from")
                                .rating(1.1)
                                .tag("tag")
                                .revenue(1000000L)
                                .prequel("prequel")
                                .book("book")
                                .metadata(new HashMap<String, Object>() {
                                    {
                                        put("metadata", new HashMap<String, Object>() {
                                            {
                                                put("key", "value");
                                            }
                                        });
                                    }
                                })
                                .cast(Arrays.asList("cast", "cast"))
                                .build())
                        .entity(Entity.builder()
                                .type(Type.of(BasicType.PRIMITIVE))
                                .name("name")
                                .build())
                        .metadata(Metadata.html("metadata"))
                        .commonMetadata(Metadata.builder()
                                .id("id")
                                .data(new HashMap<String, String>() {
                                    {
                                        put("data", "data");
                                    }
                                })
                                .jsonString("jsonString")
                                .build())
                        .eventInfo(EventInfo.metadata(Metadata.builder()
                                .id("id")
                                .data(new HashMap<String, String>() {
                                    {
                                        put("data", "data");
                                    }
                                })
                                .jsonString("jsonString")
                                .build()))
                        .data(Data.string("data"))
                        .migration(Migration.builder()
                                .name("name")
                                .status(MigrationStatus.RUNNING)
                                .build())
                        .exception(Exception.generic(ExceptionInfo.builder()
                                .exceptionType("exceptionType")
                                .exceptionMessage("exceptionMessage")
                                .exceptionStacktrace("exceptionStacktrace")
                                .build()))
                        .test(Test.and(true))
                        .node(Node.builder()
                                .name("name")
                                .nodes(Optional.of(Arrays.asList(
                                        Node.builder()
                                                .name("name")
                                                .nodes(Optional.of(Arrays.asList(
                                                        Node.builder()
                                                                .name("name")
                                                                .nodes(Optional.of(new ArrayList<Node>()))
                                                                .trees(Optional.of(new ArrayList<Tree>()))
                                                                .build(),
                                                        Node.builder()
                                                                .name("name")
                                                                .nodes(Optional.of(new ArrayList<Node>()))
                                                                .trees(Optional.of(new ArrayList<Tree>()))
                                                                .build())))
                                                .trees(Optional.of(Arrays.asList(
                                                        Tree.builder()
                                                                .nodes(Optional.of(new ArrayList<Node>()))
                                                                .build(),
                                                        Tree.builder()
                                                                .nodes(Optional.of(new ArrayList<Node>()))
                                                                .build())))
                                                .build(),
                                        Node.builder()
                                                .name("name")
                                                .nodes(Optional.of(Arrays.asList(
                                                        Node.builder()
                                                                .name("name")
                                                                .nodes(Optional.of(new ArrayList<Node>()))
                                                                .trees(Optional.of(new ArrayList<Tree>()))
                                                                .build(),
                                                        Node.builder()
                                                                .name("name")
                                                                .nodes(Optional.of(new ArrayList<Node>()))
                                                                .trees(Optional.of(new ArrayList<Tree>()))
                                                                .build())))
                                                .trees(Optional.of(Arrays.asList(
                                                        Tree.builder()
                                                                .nodes(Optional.of(new ArrayList<Node>()))
                                                                .build(),
                                                        Tree.builder()
                                                                .nodes(Optional.of(new ArrayList<Node>()))
                                                                .build())))
                                                .build())))
                                .trees(Optional.of(Arrays.asList(
                                        Tree.builder()
                                                .nodes(Optional.of(Arrays.asList(
                                                        Node.builder()
                                                                .name("name")
                                                                .nodes(Optional.of(new ArrayList<Node>()))
                                                                .trees(Optional.of(new ArrayList<Tree>()))
                                                                .build(),
                                                        Node.builder()
                                                                .name("name")
                                                                .nodes(Optional.of(new ArrayList<Node>()))
                                                                .trees(Optional.of(new ArrayList<Tree>()))
                                                                .build())))
                                                .build(),
                                        Tree.builder()
                                                .nodes(Optional.of(Arrays.asList(
                                                        Node.builder()
                                                                .name("name")
                                                                .nodes(Optional.of(new ArrayList<Node>()))
                                                                .trees(Optional.of(new ArrayList<Tree>()))
                                                                .build(),
                                                        Node.builder()
                                                                .name("name")
                                                                .nodes(Optional.of(new ArrayList<Node>()))
                                                                .trees(Optional.of(new ArrayList<Tree>()))
                                                                .build())))
                                                .build())))
                                .build())
                        .directory(Directory.builder()
                                .name("name")
                                .files(Optional.of(Arrays.asList(
                                        File.builder()
                                                .name("name")
                                                .contents("contents")
                                                .build(),
                                        File.builder()
                                                .name("name")
                                                .contents("contents")
                                                .build())))
                                .directories(Optional.of(Arrays.asList(
                                        Directory.builder()
                                                .name("name")
                                                .files(Optional.of(Arrays.asList(
                                                        File.builder()
                                                                .name("name")
                                                                .contents("contents")
                                                                .build(),
                                                        File.builder()
                                                                .name("name")
                                                                .contents("contents")
                                                                .build())))
                                                .directories(Optional.of(Arrays.asList(
                                                        Directory.builder()
                                                                .name("name")
                                                                .files(Optional.of(new ArrayList<File>()))
                                                                .directories(Optional.of(new ArrayList<Directory>()))
                                                                .build(),
                                                        Directory.builder()
                                                                .name("name")
                                                                .files(Optional.of(new ArrayList<File>()))
                                                                .directories(Optional.of(new ArrayList<Directory>()))
                                                                .build())))
                                                .build(),
                                        Directory.builder()
                                                .name("name")
                                                .files(Optional.of(Arrays.asList(
                                                        File.builder()
                                                                .name("name")
                                                                .contents("contents")
                                                                .build(),
                                                        File.builder()
                                                                .name("name")
                                                                .contents("contents")
                                                                .build())))
                                                .directories(Optional.of(Arrays.asList(
                                                        Directory.builder()
                                                                .name("name")
                                                                .files(Optional.of(new ArrayList<File>()))
                                                                .directories(Optional.of(new ArrayList<Directory>()))
                                                                .build(),
                                                        Directory.builder()
                                                                .name("name")
                                                                .files(Optional.of(new ArrayList<File>()))
                                                                .directories(Optional.of(new ArrayList<Directory>()))
                                                                .build())))
                                                .build())))
                                .build())
                        .moment(Moment.builder()
                                .id(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                                .date("2023-01-15")
                                .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .build())
                        .build());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = ""
                + "{\n"
                + "  \"castMember\": {\n"
                + "    \"name\": \"name\",\n"
                + "    \"id\": \"id\"\n"
                + "  },\n"
                + "  \"extendedMovie\": {\n"
                + "    \"cast\": [\n"
                + "      \"cast\",\n"
                + "      \"cast\"\n"
                + "    ],\n"
                + "    \"id\": \"id\",\n"
                + "    \"prequel\": \"prequel\",\n"
                + "    \"title\": \"title\",\n"
                + "    \"from\": \"from\",\n"
                + "    \"rating\": 1.1,\n"
                + "    \"type\": \"movie\",\n"
                + "    \"tag\": \"tag\",\n"
                + "    \"book\": \"book\",\n"
                + "    \"metadata\": {\n"
                + "      \"metadata\": {\n"
                + "        \"key\": \"value\"\n"
                + "      }\n"
                + "    },\n"
                + "    \"revenue\": 1000000\n"
                + "  },\n"
                + "  \"entity\": {\n"
                + "    \"type\": \"primitive\",\n"
                + "    \"name\": \"name\"\n"
                + "  },\n"
                + "  \"metadata\": {\n"
                + "    \"type\": \"html\",\n"
                + "    \"value\": \"metadata\",\n"
                + "    \"extra\": {\n"
                + "      \"extra\": \"extra\"\n"
                + "    },\n"
                + "    \"tags\": [\n"
                + "      \"tags\"\n"
                + "    ]\n"
                + "  },\n"
                + "  \"commonMetadata\": {\n"
                + "    \"id\": \"id\",\n"
                + "    \"data\": {\n"
                + "      \"data\": \"data\"\n"
                + "    },\n"
                + "    \"jsonString\": \"jsonString\"\n"
                + "  },\n"
                + "  \"eventInfo\": {\n"
                + "    \"type\": \"metadata\",\n"
                + "    \"id\": \"id\",\n"
                + "    \"data\": {\n"
                + "      \"data\": \"data\"\n"
                + "    },\n"
                + "    \"jsonString\": \"jsonString\"\n"
                + "  },\n"
                + "  \"data\": {\n"
                + "    \"type\": \"string\",\n"
                + "    \"value\": \"data\"\n"
                + "  },\n"
                + "  \"migration\": {\n"
                + "    \"name\": \"name\",\n"
                + "    \"status\": \"RUNNING\"\n"
                + "  },\n"
                + "  \"exception\": {\n"
                + "    \"type\": \"generic\",\n"
                + "    \"exceptionType\": \"exceptionType\",\n"
                + "    \"exceptionMessage\": \"exceptionMessage\",\n"
                + "    \"exceptionStacktrace\": \"exceptionStacktrace\"\n"
                + "  },\n"
                + "  \"test\": {\n"
                + "    \"type\": \"and\",\n"
                + "    \"value\": true\n"
                + "  },\n"
                + "  \"node\": {\n"
                + "    \"name\": \"name\",\n"
                + "    \"nodes\": [\n"
                + "      {\n"
                + "        \"name\": \"name\",\n"
                + "        \"nodes\": [\n"
                + "          {\n"
                + "            \"name\": \"name\",\n"
                + "            \"nodes\": [],\n"
                + "            \"trees\": []\n"
                + "          },\n"
                + "          {\n"
                + "            \"name\": \"name\",\n"
                + "            \"nodes\": [],\n"
                + "            \"trees\": []\n"
                + "          }\n"
                + "        ],\n"
                + "        \"trees\": [\n"
                + "          {\n"
                + "            \"nodes\": []\n"
                + "          },\n"
                + "          {\n"
                + "            \"nodes\": []\n"
                + "          }\n"
                + "        ]\n"
                + "      },\n"
                + "      {\n"
                + "        \"name\": \"name\",\n"
                + "        \"nodes\": [\n"
                + "          {\n"
                + "            \"name\": \"name\",\n"
                + "            \"nodes\": [],\n"
                + "            \"trees\": []\n"
                + "          },\n"
                + "          {\n"
                + "            \"name\": \"name\",\n"
                + "            \"nodes\": [],\n"
                + "            \"trees\": []\n"
                + "          }\n"
                + "        ],\n"
                + "        \"trees\": [\n"
                + "          {\n"
                + "            \"nodes\": []\n"
                + "          },\n"
                + "          {\n"
                + "            \"nodes\": []\n"
                + "          }\n"
                + "        ]\n"
                + "      }\n"
                + "    ],\n"
                + "    \"trees\": [\n"
                + "      {\n"
                + "        \"nodes\": [\n"
                + "          {\n"
                + "            \"name\": \"name\",\n"
                + "            \"nodes\": [],\n"
                + "            \"trees\": []\n"
                + "          },\n"
                + "          {\n"
                + "            \"name\": \"name\",\n"
                + "            \"nodes\": [],\n"
                + "            \"trees\": []\n"
                + "          }\n"
                + "        ]\n"
                + "      },\n"
                + "      {\n"
                + "        \"nodes\": [\n"
                + "          {\n"
                + "            \"name\": \"name\",\n"
                + "            \"nodes\": [],\n"
                + "            \"trees\": []\n"
                + "          },\n"
                + "          {\n"
                + "            \"name\": \"name\",\n"
                + "            \"nodes\": [],\n"
                + "            \"trees\": []\n"
                + "          }\n"
                + "        ]\n"
                + "      }\n"
                + "    ]\n"
                + "  },\n"
                + "  \"directory\": {\n"
                + "    \"name\": \"name\",\n"
                + "    \"files\": [\n"
                + "      {\n"
                + "        \"name\": \"name\",\n"
                + "        \"contents\": \"contents\"\n"
                + "      },\n"
                + "      {\n"
                + "        \"name\": \"name\",\n"
                + "        \"contents\": \"contents\"\n"
                + "      }\n"
                + "    ],\n"
                + "    \"directories\": [\n"
                + "      {\n"
                + "        \"name\": \"name\",\n"
                + "        \"files\": [\n"
                + "          {\n"
                + "            \"name\": \"name\",\n"
                + "            \"contents\": \"contents\"\n"
                + "          },\n"
                + "          {\n"
                + "            \"name\": \"name\",\n"
                + "            \"contents\": \"contents\"\n"
                + "          }\n"
                + "        ],\n"
                + "        \"directories\": [\n"
                + "          {\n"
                + "            \"name\": \"name\",\n"
                + "            \"files\": [],\n"
                + "            \"directories\": []\n"
                + "          },\n"
                + "          {\n"
                + "            \"name\": \"name\",\n"
                + "            \"files\": [],\n"
                + "            \"directories\": []\n"
                + "          }\n"
                + "        ]\n"
                + "      },\n"
                + "      {\n"
                + "        \"name\": \"name\",\n"
                + "        \"files\": [\n"
                + "          {\n"
                + "            \"name\": \"name\",\n"
                + "            \"contents\": \"contents\"\n"
                + "          },\n"
                + "          {\n"
                + "            \"name\": \"name\",\n"
                + "            \"contents\": \"contents\"\n"
                + "          }\n"
                + "        ],\n"
                + "        \"directories\": [\n"
                + "          {\n"
                + "            \"name\": \"name\",\n"
                + "            \"files\": [],\n"
                + "            \"directories\": []\n"
                + "          },\n"
                + "          {\n"
                + "            \"name\": \"name\",\n"
                + "            \"files\": [],\n"
                + "            \"directories\": []\n"
                + "          }\n"
                + "        ]\n"
                + "      }\n"
                + "    ]\n"
                + "  },\n"
                + "  \"moment\": {\n"
                + "    \"id\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n"
                + "    \"date\": \"2023-01-15\",\n"
                + "    \"datetime\": \"2024-01-15T09:30:00Z\"\n"
                + "  }\n"
                + "}";
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

        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = ""
                + "{\n"
                + "  \"response\": {\n"
                + "    \"key\": \"value\"\n"
                + "  },\n"
                + "  \"identifiers\": [\n"
                + "    {\n"
                + "      \"type\": \"primitive\",\n"
                + "      \"value\": \"value\",\n"
                + "      \"label\": \"label\"\n"
                + "    },\n"
                + "    {\n"
                + "      \"type\": \"primitive\",\n"
                + "      \"value\": \"value\",\n"
                + "      \"label\": \"label\"\n"
                + "    }\n"
                + "  ]\n"
                + "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertTrue(
                jsonEquals(expectedResponseNode, actualResponseNode),
                "Response body structure does not match expected");
        if (actualResponseNode.has("type") || actualResponseNode.has("_type") || actualResponseNode.has("kind")) {
            String discriminator = null;
            if (actualResponseNode.has("type"))
                discriminator = actualResponseNode.get("type").asText();
            else if (actualResponseNode.has("_type"))
                discriminator = actualResponseNode.get("_type").asText();
            else if (actualResponseNode.has("kind"))
                discriminator = actualResponseNode.get("kind").asText();
            Assertions.assertNotNull(discriminator, "Union type should have a discriminator field");
            Assertions.assertFalse(discriminator.isEmpty(), "Union discriminator should not be empty");
        }

        if (!actualResponseNode.isNull()) {
            Assertions.assertTrue(
                    actualResponseNode.isObject() || actualResponseNode.isArray() || actualResponseNode.isValueNode(),
                    "response should be a valid JSON value");
        }

        if (actualResponseNode.isArray()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Array should have valid size");
        }
        if (actualResponseNode.isObject()) {
            Assertions.assertTrue(actualResponseNode.size() >= 0, "Object should have valid field count");
        }
    }

    @Test
    public void testRefreshToken() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("{}"));
        client.service().refreshToken(Optional.empty());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
    }

    /**
     * Compares two JsonNodes with numeric equivalence.
     */
    private boolean jsonEquals(JsonNode a, JsonNode b) {
        if (a.equals(b)) return true;
        if (a.isNumber() && b.isNumber()) return Math.abs(a.doubleValue() - b.doubleValue()) < 1e-10;
        if (a.isObject() && b.isObject()) {
            if (a.size() != b.size()) return false;
            java.util.Iterator<java.util.Map.Entry<String, JsonNode>> iter = a.fields();
            while (iter.hasNext()) {
                java.util.Map.Entry<String, JsonNode> entry = iter.next();
                if (!jsonEquals(entry.getValue(), b.get(entry.getKey()))) return false;
            }
            return true;
        }
        if (a.isArray() && b.isArray()) {
            if (a.size() != b.size()) return false;
            for (int i = 0; i < a.size(); i++) {
                if (!jsonEquals(a.get(i), b.get(i))) return false;
            }
            return true;
        }
        return false;
    }
}
