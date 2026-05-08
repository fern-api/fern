package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.endpoints.types.GetWithPathAndQueryParamsRequest;

public class Example75 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .params()
                .getWithPathAndQuery(
                        "param",
                        GetWithPathAndQueryParamsRequest.builder()
                                .query("query")
                                .build());
    }
}
