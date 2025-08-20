package com.seed.examples;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

import com.seed.examples.SeedExamplesClient;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
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
    public void testGetMovie() {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().getMovie("movieId");

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("GET", recorded.getMethod());
        assertEquals("/movie/movie-c06a4ad7", recorded.getPath());
    }
    @Test
    public void testCreateMovie() {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().createMovie();

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("POST", recorded.getMethod());
        assertEquals("/movie", recorded.getPath());

        // Verify request body
        String requestBody = recorded.getBody().readUtf8();
        assertEquals("{\"id\":\"movie-c06a4ad7\",\"prequel\":\"movie-cv9b914f\",\"title\":\"The Boy and the Heron\",\"from\":\"Hayao Miyazaki\",\"rating\":8,\"type\":\"movie\",\"tag\":\"tag-wf9as23d\",\"metadata\":{\"actors\":[\"Christian Bale\",\"Florence Pugh\",\"Willem Dafoe\"],\"releaseDate\":\"2023-12-08\",\"ratings\":{\"rottenTomatoes\":97,\"imdb\":7.6}},\"revenue\":1000000}", requestBody);
    }
    @Test
    public void testGetMetadata() {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().getMetadata();

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("GET", recorded.getMethod());
        assertEquals("/metadata", recorded.getPath());

        // Verify endpoint headers
        assertEquals("0.0.1", recorded.getHeader("X-API-Version"));
    }
    @Test
    public void testCreateBigEntity() {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().createBigEntity();

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("POST", recorded.getMethod());
        assertEquals("/big-entity", recorded.getPath());

        // Verify request body
        String requestBody = recorded.getBody().readUtf8();
        assertEquals("{\"castMember\":{\"name\":\"name\",\"id\":\"id\"},\"extendedMovie\":{\"cast\":[\"cast\",\"cast\"],\"id\":\"id\",\"prequel\":\"prequel\",\"title\":\"title\",\"from\":\"from\",\"rating\":1.1,\"type\":\"movie\",\"tag\":\"tag\",\"book\":\"book\",\"metadata\":{\"metadata\":{\"key\":\"value\"}},\"revenue\":1000000},\"entity\":{\"type\":\"primitive\",\"name\":\"name\"},\"metadata\":{\"type\":\"html\",\"value\":\"metadata\",\"extra\":{\"extra\":\"extra\"},\"tags\":[\"tags\"]},\"commonMetadata\":{\"id\":\"id\",\"data\":{\"data\":\"data\"},\"jsonString\":\"jsonString\"},\"eventInfo\":{\"type\":\"metadata\",\"id\":\"id\",\"data\":{\"data\":\"data\"},\"jsonString\":\"jsonString\"},\"data\":{\"type\":\"string\",\"value\":\"data\"},\"migration\":{\"name\":\"name\",\"status\":\"RUNNING\"},\"exception\":{\"type\":\"generic\",\"exceptionType\":\"exceptionType\",\"exceptionMessage\":\"exceptionMessage\",\"exceptionStacktrace\":\"exceptionStacktrace\"},\"test\":{\"type\":\"and\",\"value\":true},\"node\":{\"name\":\"name\",\"nodes\":[{\"name\":\"name\",\"nodes\":[{\"name\":\"name\",\"nodes\":[],\"trees\":[]},{\"name\":\"name\",\"nodes\":[],\"trees\":[]}],\"trees\":[{\"nodes\":[]},{\"nodes\":[]}]},{\"name\":\"name\",\"nodes\":[{\"name\":\"name\",\"nodes\":[],\"trees\":[]},{\"name\":\"name\",\"nodes\":[],\"trees\":[]}],\"trees\":[{\"nodes\":[]},{\"nodes\":[]}]}],\"trees\":[{\"nodes\":[{\"name\":\"name\",\"nodes\":[],\"trees\":[]},{\"name\":\"name\",\"nodes\":[],\"trees\":[]}]},{\"nodes\":[{\"name\":\"name\",\"nodes\":[],\"trees\":[]},{\"name\":\"name\",\"nodes\":[],\"trees\":[]}]}]},\"directory\":{\"name\":\"name\",\"files\":[{\"name\":\"name\",\"contents\":\"contents\"},{\"name\":\"name\",\"contents\":\"contents\"}],\"directories\":[{\"name\":\"name\",\"files\":[{\"name\":\"name\",\"contents\":\"contents\"},{\"name\":\"name\",\"contents\":\"contents\"}],\"directories\":[{\"name\":\"name\",\"files\":[],\"directories\":[]},{\"name\":\"name\",\"files\":[],\"directories\":[]}]},{\"name\":\"name\",\"files\":[{\"name\":\"name\",\"contents\":\"contents\"},{\"name\":\"name\",\"contents\":\"contents\"}],\"directories\":[{\"name\":\"name\",\"files\":[],\"directories\":[]},{\"name\":\"name\",\"files\":[],\"directories\":[]}]}]},\"moment\":{\"id\":\"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\",\"date\":\"2023-01-15\",\"datetime\":\"2024-01-15T09:30:00Z\"}}", requestBody);
    }
    @Test
    public void testRefreshToken() {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().refreshToken();

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("POST", recorded.getMethod());
        assertEquals("/refresh-token", recorded.getPath());

        // Verify request body
        String requestBody = recorded.getBody().readUtf8();
        assertEquals("{}", requestBody);
    }
}
