package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.CreatePlantOrderRequest;
import com.seed.api.types.PlantOrder;

public class Example0 {
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
                                .build())
                        .build());
    }
}
