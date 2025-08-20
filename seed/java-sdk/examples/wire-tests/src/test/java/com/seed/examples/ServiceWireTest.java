package com.seed.examples;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
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
            .setBody("{}"));

        client.service().getMovie("movie-c06a4ad7");;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("GET", request.getMethod());
    }

    @Test
    public void testCreateMovie() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        client.service().createMovie(
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
                        put("actors", new
                        ArrayList<Object>() {Arrays.asList("Christian Bale", "Florence Pugh", "Willem Dafoe")
                        });
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
        );;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("POST", request.getMethod());
    }

    @Test
    public void testGetMetadata() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        client.service().getMetadata(
            GetMetadataRequest
                .builder()
                .xApiVersion("0.0.1")
                .tag(
                    new ArrayList<Optional<String>>(
                        Arrays.asList("development")
                    )
                )
                .shallow(false)
                .build()
        );;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("GET", request.getMethod());
    }

    @Test
    public void testCreateBigEntity() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        client.service().createBigEntity(
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
                            new ArrayList<String>(
                                Arrays.asList("cast", "cast")
                            )
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
                            new ArrayList<Node>(
                                Arrays.asList(
                                    Node
                                        .builder()
                                        .name("name")
                                        .nodes(
                                            new ArrayList<Node>(
                                                Arrays.asList(
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .trees(
                                                            new ArrayList<Tree>()
                                                        )
                                                        .build(),
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .trees(
                                                            new ArrayList<Tree>()
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .trees(
                                            new ArrayList<Tree>(
                                                Arrays.asList(
                                                    Tree
                                                        .builder()
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .build(),
                                                    Tree
                                                        .builder()
                                                        .nodes(
                                                            new ArrayList<Node>()
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
                                            new ArrayList<Node>(
                                                Arrays.asList(
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .trees(
                                                            new ArrayList<Tree>()
                                                        )
                                                        .build(),
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .trees(
                                                            new ArrayList<Tree>()
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .trees(
                                            new ArrayList<Tree>(
                                                Arrays.asList(
                                                    Tree
                                                        .builder()
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .build(),
                                                    Tree
                                                        .builder()
                                                        .nodes(
                                                            new ArrayList<Node>()
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
                            new ArrayList<Tree>(
                                Arrays.asList(
                                    Tree
                                        .builder()
                                        .nodes(
                                            new ArrayList<Node>(
                                                Arrays.asList(
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .trees(
                                                            new ArrayList<Tree>()
                                                        )
                                                        .build(),
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .trees(
                                                            new ArrayList<Tree>()
                                                        )
                                                        .build()
                                                )
                                            )
                                        )
                                        .build(),
                                    Tree
                                        .builder()
                                        .nodes(
                                            new ArrayList<Node>(
                                                Arrays.asList(
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .trees(
                                                            new ArrayList<Tree>()
                                                        )
                                                        .build(),
                                                    Node
                                                        .builder()
                                                        .name("name")
                                                        .nodes(
                                                            new ArrayList<Node>()
                                                        )
                                                        .trees(
                                                            new ArrayList<Tree>()
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
                            new ArrayList<File>(
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
                            new ArrayList<Directory>(
                                Arrays.asList(
                                    Directory
                                        .builder()
                                        .name("name")
                                        .files(
                                            new ArrayList<File>(
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
                                            new ArrayList<Directory>(
                                                Arrays.asList(
                                                    Directory
                                                        .builder()
                                                        .name("name")
                                                        .files(
                                                            new ArrayList<File>()
                                                        )
                                                        .directories(
                                                            new ArrayList<Directory>()
                                                        )
                                                        .build(),
                                                    Directory
                                                        .builder()
                                                        .name("name")
                                                        .files(
                                                            new ArrayList<File>()
                                                        )
                                                        .directories(
                                                            new ArrayList<Directory>()
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
                                            new ArrayList<File>(
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
                                            new ArrayList<Directory>(
                                                Arrays.asList(
                                                    Directory
                                                        .builder()
                                                        .name("name")
                                                        .files(
                                                            new ArrayList<File>()
                                                        )
                                                        .directories(
                                                            new ArrayList<Directory>()
                                                        )
                                                        .build(),
                                                    Directory
                                                        .builder()
                                                        .name("name")
                                                        .files(
                                                            new ArrayList<File>()
                                                        )
                                                        .directories(
                                                            new ArrayList<Directory>()
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
        );;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("POST", request.getMethod());
    }

    @Test
    public void testRefreshToken() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        client.service().refreshToken(Optional.of());;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("POST", request.getMethod());
    }

}
