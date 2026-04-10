package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.endpoints.params.requests.GetWithInlinePathAndQuery;

public class Example38 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().getWithInlinePathAndQuery(
            GetWithInlinePathAndQuery
                .builder()
                .param("param")
                .query("query")
                .build()
        );
    }
}