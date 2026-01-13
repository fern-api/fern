package com.snippets;

import com.seed.clientSideParams.SeedClientSideParamsClient;
import com.seed.clientSideParams.resources.service.requests.ListConnectionsRequest;

public class Example8 {
    public static void main(String[] args) {
        SeedClientSideParamsClient client = SeedClientSideParamsClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().listConnections(
            ListConnectionsRequest
                .builder()
                .strategy("strategy")
                .name("name")
                .fields("fields")
                .build()
        );
    }
}