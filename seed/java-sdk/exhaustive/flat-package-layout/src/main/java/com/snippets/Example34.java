package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.endpoints.types.GetWithInlinePathAndQuery;

public class Example34 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .params()
                .getWithInlinePathAndQuery(
                        "param",
                        GetWithInlinePathAndQuery.builder().query("query").build());
    }
}
