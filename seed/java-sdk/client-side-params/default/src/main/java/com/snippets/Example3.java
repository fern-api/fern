package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceGetResourceRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .getresource(
                        "resourceId",
                        ServiceGetResourceRequest.builder()
                                .includeMetadata(true)
                                .format("format")
                                .build());
    }
}
