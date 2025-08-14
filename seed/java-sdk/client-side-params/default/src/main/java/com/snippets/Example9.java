package com.snippets;

import com.seed.clientSideParams.SeedClientSideParamsClient;
import com.seed.clientSideParams.resources.service.requests.GetConnectionRequest;

public class Example9 {
    public static void main(String[] args) {
        SeedClientSideParamsClient client = SeedClientSideParamsClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().getConnection(
            "connectionId",
            GetConnectionRequest
                .builder()
                .fields("fields")
                .build()
        );
    }
}