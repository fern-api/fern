package com.seed.examples;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private ObjectMapper objectMapper = new ObjectMapper();
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
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"id\":\"movie-c06a4ad7\",\"prequel\":\"movie-cv9b914f\",\"title\":\"The Boy and the Heron\",\"from\":\"Hayao Miyazaki\",\"rating\":8,\"type\":\"movie\",\"tag\":\"tag-wf9as23d\",\"metadata\":{\"actors\":[\"Christian Bale\",\"Florence Pugh\",\"Willem Dafoe\"],\"releaseDate\":\"2023-12-08\",\"ratings\":{\"rottenTomatoes\":97,\"imdb\":7.6}},\"revenue\":1000000}"));
        Movie response = client.service().getMovie("movie-c06a4ad7");
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"id\": \"movie-c06a4ad7\",\n" +
            "  \"prequel\": \"movie-cv9b914f\",\n" +
            "  \"title\": \"The Boy and the Heron\",\n" +
            "  \"from\": \"Hayao Miyazaki\",\n" +
            "  \"rating\": 8,\n" +
            "  \"type\": \"movie\",\n" +
            "  \"tag\": \"tag-wf9as23d\",\n" +
            "  \"metadata\": {\n" +
            "    \"actors\": [\n" +
            "      \"Christian Bale\",\n" +
            "      \"Florence Pugh\",\n" +
            "      \"Willem Dafoe\"\n" +
            "    ],\n" +
            "    \"releaseDate\": \"2023-12-08\",\n" +
            "    \"ratings\": {\n" +
            "      \"rottenTomatoes\": 97,\n" +
            "      \"imdb\": 7.6\n" +
            "    }\n" +
            "  },\n" +
            "  \"revenue\": 1000000\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body does not match expected");
    }
    @Test
    public void testCreateMovie() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("\"movie-c06a4ad7\""));
        String response = client.service().createMovie(
            Movie
                .builder()
                .id("movie-c06a4ad7")
                .title("The Boy and the Heron")
                .from("Hayao Miyazaki")
                .rating(8)
                .type("movie")
                .tag("tag-wf9as23d")
                .metadata(
                    new HashMap<String, Object>() {{
                        put("actors", new ArrayList<Object>(Arrays.asList("Christian Bale", "Florence Pugh", "Willem Dafoe")));
                        put("releaseDate", "2023-12-08");
                        put("ratings", new 
                        HashMap<String, Object>() {{put("rottenTomatoes", 97);
                            put("imdb", 7.6);
                        }});
                    }}
                )
                .revenue(1000000L)
                .prequel("movie-cv9b914f")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "{\n" +
            "  \"id\": \"movie-c06a4ad7\",\n" +
            "  \"prequel\": \"movie-cv9b914f\",\n" +
            "  \"title\": \"The Boy and the Heron\",\n" +
            "  \"from\": \"Hayao Miyazaki\",\n" +
            "  \"rating\": 8,\n" +
            "  \"type\": \"movie\",\n" +
            "  \"tag\": \"tag-wf9as23d\",\n" +
            "  \"metadata\": {\n" +
            "    \"actors\": [\n" +
            "      \"Christian Bale\",\n" +
            "      \"Florence Pugh\",\n" +
            "      \"Willem Dafoe\"\n" +
            "    ],\n" +
            "    \"releaseDate\": \"2023-12-08\",\n" +
            "    \"ratings\": {\n" +
            "      \"rottenTomatoes\": 97,\n" +
            "      \"imdb\": 7.6\n" +
            "    }\n" +
            "  },\n" +
            "  \"revenue\": 1000000\n" +
            "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body does not match expected");
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "\"movie-c06a4ad7\"";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body does not match expected");
    }
    @Test
    public void testGetMetadata() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"type\":\"html\",\"extra\":{\"version\":\"0.0.1\",\"tenancy\":\"test\"},\"tags\":[\"development\",\"public\"],\"value\":\"<head>...</head>\"}"));
        Metadata response = client.service().getMetadata(
            GetMetadataRequest
                .builder()
                .xApiVersion("0.0.1")
                .tag(
                    Arrays.asList(Optional.of("development"))
                )
                .shallow(false)
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"type\": \"html\",\n" +
            "  \"extra\": {\n" +
            "    \"version\": \"0.0.1\",\n" +
            "    \"tenancy\": \"test\"\n" +
            "  },\n" +
            "  \"tags\": [\n" +
            "    \"development\",\n" +
            "    \"public\"\n" +
            "  ],\n" +
            "  \"value\": \"<head>...</head>\"\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body does not match expected");
    }
    @Test
    public void testCreateBigEntity() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"response\":{\"key\":\"value\"},\"identifiers\":[{\"type\":\"primitive\",\"value\":\"value\",\"label\":\"label\"},{\"type\":\"primitive\",\"value\":\"value\",\"label\":\"label\"}]}"));
        Response response = client.service().createBigEntity(
            BigEntity
                .builder()
                .castMember(
                    CastMember.ofActor(
                        Actor
                            .builder()
                            .name("name")
                            .id("id")
                            .build()
                    )
                )
                .extendedMovie(
                    ExtendedMovie
                        .builder()
                        .cast(
                            Arrays.asList("cast", "cast")
                        )
                        .id("id")
                        .title("title")
                        .from("from")
                        .rating(1.1)
                        .type("movie")
                        .tag("tag")
                        .metadata(
                            new HashMap<String, Object>() {{
                                put("metadata", new 
                                HashMap<String, Object>() {{put("key", "value");
                                }});
                            }}
                        )
                        .revenue(1000000L)
                        .prequel("prequel")
                        .book("book")
                        .build()
                )
                .entity(
                    Entity
                        .builder()
                        .type(
                            Type.ofBasicType(BasicType.PRIMITIVE)
                        )
                        .name("name")
                        .build()
                )
                .metadata(
                    Metadata.html()
                )
                .commonMetadata(
                    Metadata
                        .builder()
                        .id("id")
                        .data(
                            new HashMap<String, String>() {{
                                put("data", "data");
                            }}
                        )
                        .jsonString("jsonString")
                        .build()
                )
                .eventInfo(
                    EventInfo.metadata(
                        Metadata
                            .builder()
                            .id("id")
                            .data(
                                new HashMap<String, String>() {{
                                    put("data", "data");
                                }}
                            )
                            .jsonString("jsonString")
                            .build()
                    )
                )
                .data(
                    Data.string()
                )
                .migration(
                    Migration
                        .builder()
                        .name("name")
                        .status(MigrationStatus.RUNNING)
                        .build()
                )
                .exception(
                    Exception.generic(
                        ExceptionInfo
                            .builder()
                            .exceptionType("exceptionType")
                            .exceptionMessage("exceptionMessage")
                            .exceptionStacktrace("exceptionStacktrace")
                            .build()
                    )
                )
                .test(
                    Test.and()
                )
                .node(
                    Node
                        .builder()
                        .name("name")
                        .nodes(
                            Optional.of(
                                Arrays.asList(
                                    Node
                                        .builder()
                                        .name("name")
                                        .nodes(
                                            Optional.of(
                                                Arrays.asList(
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            Optional.of(
                                                                new ArrayList<Node>()
                                                            )
                                                        )
                                                        .trees(
                                                            Optional.of(
                                                                new ArrayList<Tree>()
                                                            )
                                                        )
                                                        .build(),
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            Optional.of(
                                                                new ArrayList<Node>()
                                                            )
                                                        )
                                                        .trees(
                                                            Optional.of(
                                                                new ArrayList<Tree>()
                                                            )
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .trees(
                                            Optional.of(
                                                Arrays.asList(
                                                    Tree
                                                        .builder()
                                                        .nodes(
                                                            Optional.of(
                                                                new ArrayList<Node>()
                                                            )
                                                        )
                                                        .build(),
                                                    Tree
                                                        .builder()
                                                        .nodes(
                                                            Optional.of(
                                                                new ArrayList<Node>()
                                                            )
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .build(),
                                    Node
                                        .builder()
                                        .name("name")
                                        .nodes(
                                            Optional.of(
                                                Arrays.asList(
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            Optional.of(
                                                                new ArrayList<Node>()
                                                            )
                                                        )
                                                        .trees(
                                                            Optional.of(
                                                                new ArrayList<Tree>()
                                                            )
                                                        )
                                                        .build(),
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            Optional.of(
                                                                new ArrayList<Node>()
                                                            )
                                                        )
                                                        .trees(
                                                            Optional.of(
                                                                new ArrayList<Tree>()
                                                            )
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .trees(
                                            Optional.of(
                                                Arrays.asList(
                                                    Tree
                                                        .builder()
                                                        .nodes(
                                                            Optional.of(
                                                                new ArrayList<Node>()
                                                            )
                                                        )
                                                        .build(),
                                                    Tree
                                                        .builder()
                                                        .nodes(
                                                            Optional.of(
                                                                new ArrayList<Node>()
                                                            )
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .build()
                                )
                            )
                        )
                        .trees(
                            Optional.of(
                                Arrays.asList(
                                    Tree
                                        .builder()
                                        .nodes(
                                            Optional.of(
                                                Arrays.asList(
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            Optional.of(
                                                                new ArrayList<Node>()
                                                            )
                                                        )
                                                        .trees(
                                                            Optional.of(
                                                                new ArrayList<Tree>()
                                                            )
                                                        )
                                                        .build(),
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            Optional.of(
                                                                new ArrayList<Node>()
                                                            )
                                                        )
                                                        .trees(
                                                            Optional.of(
                                                                new ArrayList<Tree>()
                                                            )
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .build(),
                                    Tree
                                        .builder()
                                        .nodes(
                                            Optional.of(
                                                Arrays.asList(
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            Optional.of(
                                                                new ArrayList<Node>()
                                                            )
                                                        )
                                                        .trees(
                                                            Optional.of(
                                                                new ArrayList<Tree>()
                                                            )
                                                        )
                                                        .build(),
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            Optional.of(
                                                                new ArrayList<Node>()
                                                            )
                                                        )
                                                        .trees(
                                                            Optional.of(
                                                                new ArrayList<Tree>()
                                                            )
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .build()
                                )
                            )
                        )
                        .build()
                )
                .directory(
                    Directory
                        .builder()
                        .name("name")
                        .files(
                            Optional.of(
                                Arrays.asList(
                                    File
                                        .builder()
                                        .name("name")
                                        .contents("contents")
                                        .build(),
                                    File
                                        .builder()
                                        .name("name")
                                        .contents("contents")
                                        .build()
                                )
                            )
                        )
                        .directories(
                            Optional.of(
                                Arrays.asList(
                                    Directory
                                        .builder()
                                        .name("name")
                                        .files(
                                            Optional.of(
                                                Arrays.asList(
                                                    File
                                                        .builder()
                                                        .name("name")
                                                        .contents("contents")
                                                        .build(),
                                                    File
                                                        .builder()
                                                        .name("name")
                                                        .contents("contents")
                                                        .build()
                                                )
                                            )
                                        )
                                        .directories(
                                            Optional.of(
                                                Arrays.asList(
                                                    Directory
                                                        .builder()
                                                        .name("name")
                                                        .files(
                                                            Optional.of(
                                                                new ArrayList<File>()
                                                            )
                                                        )
                                                        .directories(
                                                            Optional.of(
                                                                new ArrayList<Directory>()
                                                            )
                                                        )
                                                        .build(),
                                                    Directory
                                                        .builder()
                                                        .name("name")
                                                        .files(
                                                            Optional.of(
                                                                new ArrayList<File>()
                                                            )
                                                        )
                                                        .directories(
                                                            Optional.of(
                                                                new ArrayList<Directory>()
                                                            )
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .build(),
                                    Directory
                                        .builder()
                                        .name("name")
                                        .files(
                                            Optional.of(
                                                Arrays.asList(
                                                    File
                                                        .builder()
                                                        .name("name")
                                                        .contents("contents")
                                                        .build(),
                                                    File
                                                        .builder()
                                                        .name("name")
                                                        .contents("contents")
                                                        .build()
                                                )
                                            )
                                        )
                                        .directories(
                                            Optional.of(
                                                Arrays.asList(
                                                    Directory
                                                        .builder()
                                                        .name("name")
                                                        .files(
                                                            Optional.of(
                                                                new ArrayList<File>()
                                                            )
                                                        )
                                                        .directories(
                                                            Optional.of(
                                                                new ArrayList<Directory>()
                                                            )
                                                        )
                                                        .build(),
                                                    Directory
                                                        .builder()
                                                        .name("name")
                                                        .files(
                                                            Optional.of(
                                                                new ArrayList<File>()
                                                            )
                                                        )
                                                        .directories(
                                                            Optional.of(
                                                                new ArrayList<Directory>()
                                                            )
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .build()
                                )
                            )
                        )
                        .build()
                )
                .moment(
                    Moment
                        .builder()
                        .id(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                        .date("2023-01-15")
                        .datetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .build()
                )
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "{\n" +
            "  \"castMember\": {\n" +
            "    \"name\": \"name\",\n" +
            "    \"id\": \"id\"\n" +
            "  },\n" +
            "  \"extendedMovie\": {\n" +
            "    \"cast\": [\n" +
            "      \"cast\",\n" +
            "      \"cast\"\n" +
            "    ],\n" +
            "    \"id\": \"id\",\n" +
            "    \"prequel\": \"prequel\",\n" +
            "    \"title\": \"title\",\n" +
            "    \"from\": \"from\",\n" +
            "    \"rating\": 1.1,\n" +
            "    \"type\": \"movie\",\n" +
            "    \"tag\": \"tag\",\n" +
            "    \"book\": \"book\",\n" +
            "    \"metadata\": {\n" +
            "      \"metadata\": {\n" +
            "        \"key\": \"value\"\n" +
            "      }\n" +
            "    },\n" +
            "    \"revenue\": 1000000\n" +
            "  },\n" +
            "  \"entity\": {\n" +
            "    \"type\": \"primitive\",\n" +
            "    \"name\": \"name\"\n" +
            "  },\n" +
            "  \"metadata\": {\n" +
            "    \"type\": \"html\",\n" +
            "    \"value\": \"metadata\",\n" +
            "    \"extra\": {\n" +
            "      \"extra\": \"extra\"\n" +
            "    },\n" +
            "    \"tags\": [\n" +
            "      \"tags\"\n" +
            "    ]\n" +
            "  },\n" +
            "  \"commonMetadata\": {\n" +
            "    \"id\": \"id\",\n" +
            "    \"data\": {\n" +
            "      \"data\": \"data\"\n" +
            "    },\n" +
            "    \"jsonString\": \"jsonString\"\n" +
            "  },\n" +
            "  \"eventInfo\": {\n" +
            "    \"type\": \"metadata\",\n" +
            "    \"id\": \"id\",\n" +
            "    \"data\": {\n" +
            "      \"data\": \"data\"\n" +
            "    },\n" +
            "    \"jsonString\": \"jsonString\"\n" +
            "  },\n" +
            "  \"data\": {\n" +
            "    \"type\": \"string\",\n" +
            "    \"value\": \"data\"\n" +
            "  },\n" +
            "  \"migration\": {\n" +
            "    \"name\": \"name\",\n" +
            "    \"status\": \"RUNNING\"\n" +
            "  },\n" +
            "  \"exception\": {\n" +
            "    \"type\": \"generic\",\n" +
            "    \"exceptionType\": \"exceptionType\",\n" +
            "    \"exceptionMessage\": \"exceptionMessage\",\n" +
            "    \"exceptionStacktrace\": \"exceptionStacktrace\"\n" +
            "  },\n" +
            "  \"test\": {\n" +
            "    \"type\": \"and\",\n" +
            "    \"value\": true\n" +
            "  },\n" +
            "  \"node\": {\n" +
            "    \"name\": \"name\",\n" +
            "    \"nodes\": [\n" +
            "      {\n" +
            "        \"name\": \"name\",\n" +
            "        \"nodes\": [\n" +
            "          {\n" +
            "            \"name\": \"name\",\n" +
            "            \"nodes\": [],\n" +
            "            \"trees\": []\n" +
            "          },\n" +
            "          {\n" +
            "            \"name\": \"name\",\n" +
            "            \"nodes\": [],\n" +
            "            \"trees\": []\n" +
            "          }\n" +
            "        ],\n" +
            "        \"trees\": [\n" +
            "          {\n" +
            "            \"nodes\": []\n" +
            "          },\n" +
            "          {\n" +
            "            \"nodes\": []\n" +
            "          }\n" +
            "        ]\n" +
            "      },\n" +
            "      {\n" +
            "        \"name\": \"name\",\n" +
            "        \"nodes\": [\n" +
            "          {\n" +
            "            \"name\": \"name\",\n" +
            "            \"nodes\": [],\n" +
            "            \"trees\": []\n" +
            "          },\n" +
            "          {\n" +
            "            \"name\": \"name\",\n" +
            "            \"nodes\": [],\n" +
            "            \"trees\": []\n" +
            "          }\n" +
            "        ],\n" +
            "        \"trees\": [\n" +
            "          {\n" +
            "            \"nodes\": []\n" +
            "          },\n" +
            "          {\n" +
            "            \"nodes\": []\n" +
            "          }\n" +
            "        ]\n" +
            "      }\n" +
            "    ],\n" +
            "    \"trees\": [\n" +
            "      {\n" +
            "        \"nodes\": [\n" +
            "          {\n" +
            "            \"name\": \"name\",\n" +
            "            \"nodes\": [],\n" +
            "            \"trees\": []\n" +
            "          },\n" +
            "          {\n" +
            "            \"name\": \"name\",\n" +
            "            \"nodes\": [],\n" +
            "            \"trees\": []\n" +
            "          }\n" +
            "        ]\n" +
            "      },\n" +
            "      {\n" +
            "        \"nodes\": [\n" +
            "          {\n" +
            "            \"name\": \"name\",\n" +
            "            \"nodes\": [],\n" +
            "            \"trees\": []\n" +
            "          },\n" +
            "          {\n" +
            "            \"name\": \"name\",\n" +
            "            \"nodes\": [],\n" +
            "            \"trees\": []\n" +
            "          }\n" +
            "        ]\n" +
            "      }\n" +
            "    ]\n" +
            "  },\n" +
            "  \"directory\": {\n" +
            "    \"name\": \"name\",\n" +
            "    \"files\": [\n" +
            "      {\n" +
            "        \"name\": \"name\",\n" +
            "        \"contents\": \"contents\"\n" +
            "      },\n" +
            "      {\n" +
            "        \"name\": \"name\",\n" +
            "        \"contents\": \"contents\"\n" +
            "      }\n" +
            "    ],\n" +
            "    \"directories\": [\n" +
            "      {\n" +
            "        \"name\": \"name\",\n" +
            "        \"files\": [\n" +
            "          {\n" +
            "            \"name\": \"name\",\n" +
            "            \"contents\": \"contents\"\n" +
            "          },\n" +
            "          {\n" +
            "            \"name\": \"name\",\n" +
            "            \"contents\": \"contents\"\n" +
            "          }\n" +
            "        ],\n" +
            "        \"directories\": [\n" +
            "          {\n" +
            "            \"name\": \"name\",\n" +
            "            \"files\": [],\n" +
            "            \"directories\": []\n" +
            "          },\n" +
            "          {\n" +
            "            \"name\": \"name\",\n" +
            "            \"files\": [],\n" +
            "            \"directories\": []\n" +
            "          }\n" +
            "        ]\n" +
            "      },\n" +
            "      {\n" +
            "        \"name\": \"name\",\n" +
            "        \"files\": [\n" +
            "          {\n" +
            "            \"name\": \"name\",\n" +
            "            \"contents\": \"contents\"\n" +
            "          },\n" +
            "          {\n" +
            "            \"name\": \"name\",\n" +
            "            \"contents\": \"contents\"\n" +
            "          }\n" +
            "        ],\n" +
            "        \"directories\": [\n" +
            "          {\n" +
            "            \"name\": \"name\",\n" +
            "            \"files\": [],\n" +
            "            \"directories\": []\n" +
            "          },\n" +
            "          {\n" +
            "            \"name\": \"name\",\n" +
            "            \"files\": [],\n" +
            "            \"directories\": []\n" +
            "          }\n" +
            "        ]\n" +
            "      }\n" +
            "    ]\n" +
            "  },\n" +
            "  \"moment\": {\n" +
            "    \"id\": \"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\n" +
            "    \"date\": \"2023-01-15\",\n" +
            "    \"datetime\": \"2024-01-15T09:30:00Z\"\n" +
            "  }\n" +
            "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body does not match expected");
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"response\": {\n" +
            "    \"key\": \"value\"\n" +
            "  },\n" +
            "  \"identifiers\": [\n" +
            "    {\n" +
            "      \"type\": \"primitive\",\n" +
            "      \"value\": \"value\",\n" +
            "      \"label\": \"label\"\n" +
            "    },\n" +
            "    {\n" +
            "      \"type\": \"primitive\",\n" +
            "      \"value\": \"value\",\n" +
            "      \"label\": \"label\"\n" +
            "    }\n" +
            "  ]\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body does not match expected");
    }
    @Test
    public void testRefreshToken() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.service().refreshToken(Optional.of());
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
    }
}
