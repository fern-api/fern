package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceSearchResourcesRequest;

public class Example4 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .searchresources(ServiceSearchResourcesRequest.builder()
                        .limit(1)
                        .offset(1)
                        .build());
    }
}
