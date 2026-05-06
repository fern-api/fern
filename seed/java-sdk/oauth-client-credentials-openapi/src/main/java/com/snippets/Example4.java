package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.plants.requests.PlantsGetRequest;

public class Example4 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.withCredentials("<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.plants().get("plantId", PlantsGetRequest.builder().build());
    }
}
