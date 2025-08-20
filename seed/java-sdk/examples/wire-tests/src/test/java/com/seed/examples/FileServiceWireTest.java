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
public class FileServiceWireTest {
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
    public void testGetFile() {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(500)
            .setBody("\"A file with that name was not found!\""));

        // Make the client call
        client.file().service().getFile("filename");

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("GET", recorded.getMethod());
        assertEquals("/file/file.txt", recorded.getPath());

        // Verify service headers
        assertEquals("0.0.2", recorded.getHeader("X-File-API-Version"));
    }
}
