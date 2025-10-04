package com.seed.fileDownload;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.fileDownload.core.ObjectMappers;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class ServiceWireTest {
    private MockWebServer server;
    private SeedFileDownloadClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;

    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client =
                SeedFileDownloadClient.builder().url(server.url("/").toString()).build();
    }

    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }

    @Test
    public void testSimple() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("{}"));
        client.service().simple();
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
    }
}
