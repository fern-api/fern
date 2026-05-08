package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpoints.params.requests.GetWithInlinePathAndQueryParamsRequest;

public class Example77 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .params()
                .getWithInlinePathAndQuery(GetWithInlinePathAndQueryParamsRequest.builder()
                        .param("param")
                        .query("query")
                        .build());
    }
}
