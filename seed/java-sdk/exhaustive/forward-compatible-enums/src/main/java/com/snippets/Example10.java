package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;

public class Example10 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.withCredentials("<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().httpMethods().testGet("id");
    }
}
