package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceListConnectionsRequest;

public class Example17 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .listconnections(ServiceListConnectionsRequest.builder()
                        .strategy("strategy")
                        .name("name")
                        .fields("fields")
                        .build());
    }
}
