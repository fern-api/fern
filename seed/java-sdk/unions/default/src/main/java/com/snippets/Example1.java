package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.bigunion.requests.BigunionGetRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.bigunion().get("id", BigunionGetRequest.builder().build());
    }
}
