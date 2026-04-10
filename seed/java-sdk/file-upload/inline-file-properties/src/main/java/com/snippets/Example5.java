package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceWithFormEncodedContainersRequest;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .withformencodedcontainers(
                        ServiceWithFormEncodedContainersRequest.builder().build());
    }
}
