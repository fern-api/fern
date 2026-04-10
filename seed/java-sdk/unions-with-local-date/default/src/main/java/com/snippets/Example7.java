package com.snippets;

import com.seed.unions.SeedApiClient;
import com.seed.unions.resources.types.requests.TypesGetRequest;

public class Example7 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.types().get("id", TypesGetRequest.builder().build());
    }
}
