package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.endpoints.params.requests.GetWithMultipleQuery;
import java.util.Arrays;

public class Example36 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().getWithAllowMultipleQuery(
            GetWithMultipleQuery
                .builder()
                .query(
                    Arrays.asList("query")
                )
                .number(
                    Arrays.asList(1)
                )
                .build()
        );
    }
}