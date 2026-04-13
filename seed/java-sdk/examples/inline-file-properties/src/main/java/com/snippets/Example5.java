package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.healthservice.requests.HealthServiceCheckRequest;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.healthService()
                .healthServiceCheck(HealthServiceCheckRequest.builder().id("id").build());
    }
}
