package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.endpoints.params.requests.GetWithAllowMultipleQueryParamsRequest;
import java.util.Arrays;

public class Example73 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .params()
                .getWithAllowMultipleQuery(GetWithAllowMultipleQueryParamsRequest.builder()
                        .query(Arrays.asList("query"))
                        .number(Arrays.asList(1))
                        .build());
    }
}
