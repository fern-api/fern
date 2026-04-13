package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServicePostRequest;

public class Example8 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service().post("endpointParam", ServicePostRequest.builder().build());
    }
}
