package com.snippets;

import com.seed.clientSideParams.SeedClientSideParamsClient;
import com.seed.clientSideParams.resources.service.requests.ListUsersRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedClientSideParamsClient client = SeedClientSideParamsClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().listUsers(
            ListUsersRequest
                .builder()
                .page(1)
                .perPage(1)
                .includeTotals(true)
                .sort("sort")
                .connection("connection")
                .q("q")
                .searchEngine("search_engine")
                .fields("fields")
                .build()
        );
    }
}