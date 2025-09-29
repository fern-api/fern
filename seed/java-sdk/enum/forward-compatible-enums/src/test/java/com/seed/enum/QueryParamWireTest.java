package com.seed.enum;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seed.enum.SeedEnumClient;
import com.seed.enum.core.ObjectMappers;
import com.seed.enum.resources.queryparam.requests.SendEnumAsQueryParamRequest;
import com.seed.enum.resources.queryparam.requests.SendEnumListAsQueryParamRequest;
import com.seed.enum.types.Color;
import com.seed.enum.types.ColorOrOperand;
import com.seed.enum.types.Operand;
import java.util.Arrays;
import java.util.Optional;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class QueryParamWireTest {
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
        client.queryParam().send(
            SendEnumAsQueryParamRequest
                .builder()
                .operand(Operand.GREATER_THAN)
                .operandOrColor(
                    ColorOrOperand.of(Color.RED)
                )
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
    }
    @Test
    public void testSendList() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setBody("{}"));
        client.queryParam().sendList(
            SendEnumListAsQueryParamRequest
                .builder()
                .operand(
                    Arrays.asList(Operand.GREATER_THAN)
                )
                .maybeOperand(
                    Arrays.asList(Optional.of(Operand.GREATER_THAN))
                )
                .operandOrColor(
                    Arrays.asList(
                        ColorOrOperand.of(Color.RED)
                    )
                )
                .maybeOperandOrColor(
                    Arrays.asList(
                        Optional.of(
                            ColorOrOperand.of(Color.RED)
                        )
                    )
                )
                .build()
        );
        RecordedRequest request = server.takeRequest();
        Assertions.assertNotNull(request);
        Assertions.assertEquals("POST", request.getMethod());
    }
}
