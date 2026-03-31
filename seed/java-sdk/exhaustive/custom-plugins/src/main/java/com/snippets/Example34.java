package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.resources.endpoints.params.requests.GetWithInlinePathAndQuery;

public class Example34 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .params()
                .getWithInlinePathAndQuery(GetWithInlinePathAndQuery.builder()
                        .param("param")
                        .query("query")
                        .build());
    }
}
