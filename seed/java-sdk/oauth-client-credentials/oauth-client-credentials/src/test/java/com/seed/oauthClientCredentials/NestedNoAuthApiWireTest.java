package com.seed.oauthClientCredentials;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class NestedNoAuthApiWireTest {
    private MockWebServer server;
    private SeedOauthClientCredentialsClient client;
    private ObjectMapper objectMapper = new ObjectMapper();
    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedOauthClientCredentialsClient.builder()
            .url(server.url("/").toString())
            .clientId("test-client-id")
                        .clientSecret("test-client-secret")
            .build();
    }
    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }
    @Test
    public void testGetSomething() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.nestedNoAuth().api().getSomething();
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("GET", request.getMethod());
    }
}
