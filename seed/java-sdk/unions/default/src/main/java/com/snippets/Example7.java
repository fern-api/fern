package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.union.requests.UnionGetRequest;

public class Example7 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.union().get("id", UnionGetRequest.builder().build());
    }
}
