package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.endpoints.types.GetWithPathParamsRequest;

public class Example63 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .params()
                .getWithPath("param", GetWithPathParamsRequest.builder().build());
    }
}
