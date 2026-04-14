package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.endpoints.types.GetWithMultipleQuery;
import java.util.Arrays;

public class Example32 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .params()
                .getWithAllowMultipleQuery(GetWithMultipleQuery.builder()
                        .query(Arrays.asList("query"))
                        .number(Arrays.asList(1))
                        .build());
    }
}
