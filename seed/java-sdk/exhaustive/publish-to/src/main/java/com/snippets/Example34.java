package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;

public class Example34 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.withCredentials("<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().primitive().getAndReturnDouble(1.1);
    }
}
