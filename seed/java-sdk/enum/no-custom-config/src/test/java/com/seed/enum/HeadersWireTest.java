package com.seed.enum;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.enum.SeedEnumClient;
import com.seed.enum.core.ObjectMappers;
import com.seed.enum.resources.headers.requests.SendEnumAsHeaderRequest;
import com.seed.enum.types.Color;
import com.seed.enum.types.ColorOrOperand;
import com.seed.enum.types.Operand;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class HeadersWireTest {
    private MockWebServer server;
    private SeedEnumClient client;
    private ObjectMapper objectMapper = ObjectMappers.JSON_MAPPER;
    @BeforeEach
    public void setup() throws Exception {
        server = new MockWebServer();
        server.start();
        client = SeedEnumClient.builder()
            .url(server.url("/").toString())
            .build();
    }
    @AfterEach
    public void teardown() throws Exception {
        server.shutdown();
    }
    @Test
    public void testSend() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.headers().send(
            SendEnumAsHeaderRequest
                .builder()
                .operand(Operand.GREATER_THAN)
                .operandOrColor(
                    ColorOrOperand.of(Color.RED)
                )
                .maybeOperand(Operand.GREATER_THAN)
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
        
        // Validate headers
        Assertions.assertEquals(">", request.getHeader("operand"), "Header 'operand' should match expected value");
        Assertions.assertEquals(">", request.getHeader("maybeOperand"), "Header 'maybeOperand' should match expected value");
        Assertions.assertEquals("red", request.getHeader("operandOrColor"), "Header 'operandOrColor' should match expected value");
        Assertions.assertEquals("undefined", request.getHeader("maybeOperandOrColor"), "Header 'maybeOperandOrColor' should match expected value");
    }
}
