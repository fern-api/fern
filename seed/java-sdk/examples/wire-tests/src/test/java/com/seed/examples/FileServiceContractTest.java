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

public class FileServiceContractTest {
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
    public void testGetFile() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(404)
            .setBody("\"A file with that name was not found!\""));
        File response = client.file().service().getFile(
            "file.txt",
            GetFileRequest
                .builder()
                .xFileApiVersion("0.0.2")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());
        
        // Validate headers
        Assertions.assertEquals("0.0.2", request.getHeader("X-File-API-Version"), "Header 'X-File-API-Version' should match expected value");
        
        // Validate response deserialization
        Assertions.assertNotNull(response, "Response should not be null");
        // Verify the response can be serialized back to JSON
        String responseJson = objectMapper.writeValueAsString(response);
        Assertions.assertNotNull(responseJson);
        Assertions.assertFalse(responseJson.isEmpty());
    }
}
