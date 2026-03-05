package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.CreatePlantOrderRequest;
import com.seed.api.types.PlantOrder;
import java.time.OffsetDateTime;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.createPlantOrder(
                "plantId",
                CreatePlantOrderRequest.builder()
                        .body(PlantOrder.builder()
                                .orderId("orderId")
                                .amount(1.1)
                                .currency("currency")
                                .plantName("plantName")
                                .dateTime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .quantity(1)
                                .build())
                        .build());
    }
}
