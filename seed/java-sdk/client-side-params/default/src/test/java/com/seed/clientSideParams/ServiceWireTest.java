package com.seed.clientSideParams;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

import com.seed.clientSideParams.SeedClientSideParamsClient;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ServiceWireTest {
    private MockWebServer server;
    private SeedClientSideParamsClient client;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();

        client = SeedClientSideParamsClient.builder()
            .url(server.url("/").toString())
            .token("test-token")
            .build();
    }

    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }

    @Test
    public void testListResources() throws Exception throws Exception {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().listResources(
            com.seed.clientSideParams.resources.service.requests.ListResourcesRequest.builder()
                .page(0)
                .build()
        );

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("GET", recorded.getMethod());
        assertEquals("/api/resources", recorded.getPath());
    }
    @Test
    public void testGetResource() throws Exception {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().getResource(
            "resourceId",
            com.seed.clientSideParams.resources.service.requests.GetResourceRequest.builder().build()
        );

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("GET", recorded.getMethod());
        assertEquals("/api/resources/resourceId", recorded.getPath());
    }
    @Test
    public void testSearchResources() throws Exception {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().searchResources(
            com.seed.clientSideParams.resources.service.requests.SearchResourcesRequest.builder()
                .query("test")
                .build()
        );

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("POST", recorded.getMethod());
        assertEquals("/api/resources/search", recorded.getPath());

        // Verify request body
        String requestBody = recorded.getBody().readUtf8();
        assertEquals("{\"query\":\"query\",\"filters\":{\"filters\":{\"key\":\"value\"}}}", requestBody);
    }
    @Test
    public void testListUsers() throws Exception {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().listUsers();

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("GET", recorded.getMethod());
        assertEquals("/api/users", recorded.getPath());
    }
    @Test
    public void testGetUserById() throws Exception {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().getUserById("userId");

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("GET", recorded.getMethod());
        assertEquals("/api/users/userId", recorded.getPath());
    }
    @Test
    public void testCreateUser() throws Exception {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().createUser(
            com.seed.clientSideParams.resources.types.types.CreateUserRequest.builder()
                .email("test@example.com")
                .connection("email")
                .build()
        );

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("POST", recorded.getMethod());
        assertEquals("/api/users", recorded.getPath());

        // Verify request body
        String requestBody = recorded.getBody().readUtf8();
        assertEquals("{\"email\":\"email\",\"email_verified\":true,\"username\":\"username\",\"password\":\"password\",\"phone_number\":\"phone_number\",\"phone_verified\":true,\"user_metadata\":{\"user_metadata\":{\"key\":\"value\"}},\"app_metadata\":{\"app_metadata\":{\"key\":\"value\"}},\"connection\":\"connection\"}", requestBody);
    }
    @Test
    public void testUpdateUser() throws Exception {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().updateUser(
            "userId",
            com.seed.clientSideParams.resources.types.types.UpdateUserRequest.builder().build()
        );

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("PATCH", recorded.getMethod());
        assertEquals("/api/users/userId", recorded.getPath());

        // Verify request body
        String requestBody = recorded.getBody().readUtf8();
        assertEquals("{\"email\":\"email\",\"email_verified\":true,\"username\":\"username\",\"phone_number\":\"phone_number\",\"phone_verified\":true,\"user_metadata\":{\"user_metadata\":{\"key\":\"value\"}},\"app_metadata\":{\"app_metadata\":{\"key\":\"value\"}},\"password\":\"password\",\"blocked\":true}", requestBody);
    }
    @Test
    public void testDeleteUser() throws Exception {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().deleteUser("userId");

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("DELETE", recorded.getMethod());
        assertEquals("/api/users/userId", recorded.getPath());
    }
    @Test
    public void testListConnections() throws Exception {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().listConnections();

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("GET", recorded.getMethod());
        assertEquals("/api/connections", recorded.getPath());
    }
    @Test
    public void testGetConnection() throws Exception {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().getConnection("connectionId");

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("GET", recorded.getMethod());
        assertEquals("/api/connections/connectionId", recorded.getPath());
    }
    @Test
    public void testListClients() throws Exception {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().listClients();

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("GET", recorded.getMethod());
        assertEquals("/api/clients", recorded.getPath());
    }
    @Test
    public void testGetClient() throws Exception {
        // Setup mock response
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        // Make the client call
        client.service().getClient("clientId");

        // Verify the request
        RecordedRequest recorded = server.takeRequest();
        assertNotNull(recorded);
        assertEquals("GET", recorded.getMethod());
        assertEquals("/api/clients/clientId", recorded.getPath());
    }
}
