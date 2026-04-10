package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceGetConnectionRequest;

public class Example19 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .getconnection(
                        "connectionId",
                        ServiceGetConnectionRequest.builder().fields("fields").build());
    }
}
