package com.snippets;

import com.seed.unions.SeedApiClient;
import com.seed.unions.resources.union.requests.UnionGetRequest;

public class Example11 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.union().get("id", UnionGetRequest.builder().build());
    }
}
