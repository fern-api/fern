package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.resources.endpoints.put.requests.PutRequest;

public class Example40 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.withCredentials("<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().put().add(PutRequest.builder().id("id").build());
    }
}
