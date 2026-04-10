package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceListResourcesRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .listresources(ServiceListResourcesRequest.builder()
                        .pageLimit(1)
                        .beforeDate("2023-01-15")
                        .build());
    }
}
