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

public class AuthWireTest {
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
    public void testGetTokenWithClientCredentials() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"access_token\":\"access_token\",\"expires_in\":1,\"refresh_token\":\"refresh_token\"}"));
        TokenResponse response = client.auth().getTokenWithClientCredentials(
            GetTokenRequest
                .builder()
                .clientId("my_oauth_app_123")
                .clientSecret("sk_live_abcdef123456789")
                .audience("https://api.example.com")
                .grantType("client_credentials")
                .scope("read:users")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "{\n" +
            "  \"client_id\": \"my_oauth_app_123\",\n" +
            "  \"client_secret\": \"sk_live_abcdef123456789\",\n" +
            "  \"audience\": \"https://api.example.com\",\n" +
            "  \"grant_type\": \"client_credentials\",\n" +
            "  \"scope\": \"read:users\"\n" +
            "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body does not match expected");
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"access_token\": \"access_token\",\n" +
            "  \"expires_in\": 1,\n" +
            "  \"refresh_token\": \"refresh_token\"\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body does not match expected");
    }
    @Test
    public void testRefreshToken() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{\"access_token\":\"access_token\",\"expires_in\":1,\"refresh_token\":\"refresh_token\"}"));
        TokenResponse response = client.auth().refreshToken(
            RefreshTokenRequest
                .builder()
                .clientId("my_oauth_app_123")
                .clientSecret("sk_live_abcdef123456789")
                .refreshToken("refresh_token")
                .audience("https://api.example.com")
                .grantType("refresh_token")
                .scope("read:users")
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        // Validate request body
        String actualRequestBody = request.getBody().readUtf8();
        String expectedRequestBody = "{\n" +
            "  \"client_id\": \"my_oauth_app_123\",\n" +
            "  \"client_secret\": \"sk_live_abcdef123456789\",\n" +
            "  \"refresh_token\": \"refresh_token\",\n" +
            "  \"audience\": \"https://api.example.com\",\n" +
            "  \"grant_type\": \"refresh_token\",\n" +
            "  \"scope\": \"read:users\"\n" +
            "}";
        JsonNode actualJson = objectMapper.readTree(actualRequestBody);
        JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);
        Assertions.assertEquals(expectedJson, actualJson, "Request body does not match expected");
        
        // Validate response body
        Assertions.assertNotNull(response, "Response should not be null");
        String actualResponseJson = objectMapper.writeValueAsString(response);
        String expectedResponseBody = "{\n" +
            "  \"access_token\": \"access_token\",\n" +
            "  \"expires_in\": 1,\n" +
            "  \"refresh_token\": \"refresh_token\"\n" +
            "}";
        JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);
        JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);
        Assertions.assertEquals(expectedResponseNode, actualResponseNode, "Response body does not match expected");
    }
}
