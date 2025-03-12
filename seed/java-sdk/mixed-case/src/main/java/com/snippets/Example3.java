package com.snippets;

import com.seed.mixedCase.SeedMixedCaseClient;
import com.seed.mixedCase.resources.service.requests.ListResourcesRequest;

public class Example3 {
    public static void run() {
        SeedMixedCaseClient client = SeedMixedCaseClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().listResources(
            ListResourcesRequest
                .builder()
                .pageLimit(1)
                .beforeDate("2023-01-15")
                .build()
        );
    }
}