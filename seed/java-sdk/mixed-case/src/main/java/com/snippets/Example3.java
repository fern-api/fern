package com.snippets;

import com.seed.mixed.case.SeedMixedCaseClient;
import com.seed.mixed.case.resources.service.requests.ListResourcesRequest;

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