package com.snippets;

import com.seed.clientSideParams.SeedClientSideParamsClient;
import com.seed.clientSideParams.resources.service.requests.GetResourceRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedClientSideParamsClient client = SeedClientSideParamsClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().getResource(
            "resourceId",
            GetResourceRequest
                .builder()
                .includeMetadata(true)
                .format("json")
                .build()
        );
    }
}