package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.endpoints.types.GetWithInlinePathAndQueryParamsRequest;

public class Example78 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .params()
                .getWithInlinePathAndQuery(
                        "param",
                        GetWithInlinePathAndQueryParamsRequest.builder()
                                .query("query")
                                .build());
    }
}
