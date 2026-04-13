package com.snippets;

import com.seed.unions.SeedApiClient;
import com.seed.unions.resources.bigunion.requests.BigunionGetRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.bigunion().get("id", BigunionGetRequest.builder().build());
    }
}
