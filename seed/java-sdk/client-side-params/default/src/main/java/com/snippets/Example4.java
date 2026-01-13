package com.snippets;

import com.seed.clientSideParams.SeedClientSideParamsClient;
import com.seed.clientSideParams.resources.service.requests.GetUserRequest;

public class Example4 {
    public static void main(String[] args) {
        SeedClientSideParamsClient client = SeedClientSideParamsClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().getUserById(
            "userId",
            GetUserRequest
                .builder()
                .fields("fields")
                .includeFields(true)
                .build()
        );
    }
}