package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpoints.params.requests.GetWithInlinePathParamsRequest;

public class Example68 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .params()
                .getWithInlinePath(
                        GetWithInlinePathParamsRequest.builder().param("param").build());
    }
}
