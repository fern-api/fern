package com.snippets;

import com.seed.mixedCase.SeedMixedCaseClient;
import com.seed.mixedCase.resources.service.requests.ListResourcesRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedMixedCaseClient client =
                SeedMixedCaseClient.builder().url("https://api.fern.com").build();

        client.service()
                .listResources(ListResourcesRequest.builder()
                        .pageLimit(10)
                        .beforeDate("2023-01-01")
                        .build());
    }
}
