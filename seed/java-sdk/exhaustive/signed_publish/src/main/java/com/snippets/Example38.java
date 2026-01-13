package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.resources.endpoints.put.requests.PutRequest;

public class Example38 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().put().add("id", PutRequest.builder().build());
    }
}
