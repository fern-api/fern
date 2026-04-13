package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceGetClientRequest;

public class Example23 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .getclient(
                        "clientId",
                        ServiceGetClientRequest.builder()
                                .fields("fields")
                                .includeFields(true)
                                .build());
    }
}
