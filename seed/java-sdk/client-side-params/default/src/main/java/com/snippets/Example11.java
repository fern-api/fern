package com.snippets;

import com.seed.clientSideParams.SeedClientSideParamsClient;
import com.seed.clientSideParams.resources.service.requests.GetClientRequest;

public class Example11 {
    public static void main(String[] args) {
        SeedClientSideParamsClient client = SeedClientSideParamsClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().getClient(
            "clientId",
            GetClientRequest
                .builder()
                .fields("fields")
                .includeFields(true)
                .build()
        );
    }
}