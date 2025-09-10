package com.snippets;

import com.seed.clientSideParams.SeedClientSideParamsClient;
import com.seed.clientSideParams.resources.service.requests.ListResourcesRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedClientSideParamsClient client = SeedClientSideParamsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().listResources(
            ListResourcesRequest
                .builder()
                .page(1)
                .perPage(1)
                .sort("created_at")
                .order("desc")
                .includeTotals(true)
                .fields("fields")
                .search("search")
                .build()
        );
    }
}