package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpoints.params.requests.ModifyWithInlinePathParamsRequest;

public class Example70 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .params()
                .modifyWithInlinePath(
                        "param",
                        ModifyWithInlinePathParamsRequest.builder()
                                .body("string")
                                .build());
    }
}
