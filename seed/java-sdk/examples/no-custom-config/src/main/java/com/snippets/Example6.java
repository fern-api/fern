package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.healthservice.requests.HealthServiceCheckRequest;

public class Example6 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.healthService()
                .healthServiceCheck("id", HealthServiceCheckRequest.builder().build());
    }
}
