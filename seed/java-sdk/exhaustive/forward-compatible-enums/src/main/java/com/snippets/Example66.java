package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpoints.params.requests.ModifyWithPathParamsRequest;

public class Example66 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .params()
                .modifyWithPath(ModifyWithPathParamsRequest.builder()
                        .param("param")
                        .body("string")
                        .build());
    }
}
