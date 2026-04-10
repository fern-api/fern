package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.union.requests.Request;

public class Example6 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.union().call(Request.builder().build());
    }
}
