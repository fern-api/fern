package com.seed.variables;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.variables.SeedVariablesClient;
import com.seed.variables.core.ObjectMappers;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class ServiceWireTest {
    private MockWebServer server;
    private SeedVariablesClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;
    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedVariablesClient.builder()
            .url(server.url("/").toString())
            .build();
    }
    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }
    @Test
    public void testPost() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.service().post();
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
    }
}
