package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceGetMetadataRequest;

public class Example13 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .getmetadata(ServiceGetMetadataRequest.builder()
                        .apiVersion("X-API-Version")
                        .build());
    }
}
