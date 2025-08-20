package com.seed.clientSideParams;

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
    public void testListResources() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        client.service().listResources(
            ListResourcesRequest
                .builder()
                .page(1)
                .perPage(1)
                .sort("created_at")
                .order("desc")
                .includeTotals(true)
                .fields("fields")
                .search("search")
                .build()
        );;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("GET", request.getMethod());
    }

    @Test
    public void testGetResource() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        client.service().getResource(
            "resourceId",
            GetResourceRequest
                .builder()
                .includeMetadata(true)
                .format("json")
                .build()
        );;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("GET", request.getMethod());
    }

    @Test
    public void testSearchResources() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        client.service().searchResources(
            SearchResourcesRequest
                .builder()
                .limit(1)
                .offset(1)
                .query("query")
                .filters(
                    new HashMap<String, Object>() {{
                        put("filters", new 
                        HashMap<String, Object>() {{put("key", "value");
                        }});
                    }}
                )
                .build()
        );;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("POST", request.getMethod());
    }

    @Test
    public void testListUsers() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        client.service().listUsers(
            ListUsersRequest
                .builder()
                .page(1)
                .perPage(1)
                .includeTotals(true)
                .sort("sort")
                .connection("connection")
                .q("q")
                .searchEngine("search_engine")
                .fields("fields")
                .build()
        );;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("GET", request.getMethod());
    }

    @Test
    public void testGetUserById() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        client.service().getUserById(
            "userId",
            GetUserRequest
                .builder()
                .fields("fields")
                .includeFields(true)
                .build()
        );;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("GET", request.getMethod());
    }

    @Test
    public void testCreateUser() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        client.service().createUser(
            CreateUserRequest
                .builder()
                .email("email")
                .connection("connection")
                .emailVerified(true)
                .username("username")
                .password("password")
                .phoneNumber("phone_number")
                .phoneVerified(true)
                .userMetadata(
                    new HashMap<String, Object>() {{
                        put("user_metadata", new 
                        HashMap<String, Object>() {{put("key", "value");
                        }});
                    }}
                )
                .appMetadata(
                    new HashMap<String, Object>() {{
                        put("app_metadata", new 
                        HashMap<String, Object>() {{put("key", "value");
                        }});
                    }}
                )
                .build()
        );;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("POST", request.getMethod());
    }

    @Test
    public void testUpdateUser() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        client.service().updateUser(
            "userId",
            UpdateUserRequest
                .builder()
                .email("email")
                .emailVerified(true)
                .username("username")
                .phoneNumber("phone_number")
                .phoneVerified(true)
                .userMetadata(
                    new HashMap<String, Object>() {{
                        put("user_metadata", new 
                        HashMap<String, Object>() {{put("key", "value");
                        }});
                    }}
                )
                .appMetadata(
                    new HashMap<String, Object>() {{
                        put("app_metadata", new 
                        HashMap<String, Object>() {{put("key", "value");
                        }});
                    }}
                )
                .password("password")
                .blocked(true)
                .build()
        );;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("PATCH", request.getMethod());
    }

    @Test
    public void testDeleteUser() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        client.service().deleteUser("userId");;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("DELETE", request.getMethod());
    }

    @Test
    public void testListConnections() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        client.service().listConnections(
            ListConnectionsRequest
                .builder()
                .strategy("strategy")
                .name("name")
                .fields("fields")
                .build()
        );;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("GET", request.getMethod());
    }

    @Test
    public void testGetConnection() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        client.service().getConnection(
            "connectionId",
            GetConnectionRequest
                .builder()
                .fields("fields")
                .build()
        );;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("GET", request.getMethod());
    }

    @Test
    public void testListClients() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        client.service().listClients(
            ListClientsRequest
                .builder()
                .fields("fields")
                .includeFields(true)
                .page(1)
                .perPage(1)
                .includeTotals(true)
                .isGlobal(true)
                .isFirstParty(true)
                .appType(
                    new ArrayList<String>(
                        Arrays.asList("app_type", "app_type")
                    )
                )
                .build()
        );;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("GET", request.getMethod());
    }

    @Test
    public void testGetClient() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));

        client.service().getClient(
            "clientId",
            GetClientRequest
                .builder()
                .fields("fields")
                .includeFields(true)
                .build()
        );;

        RecordedRequest request = server.takeRequest();
        assertNotNull(request);
        assertEquals("GET", request.getMethod());
    }

}
