package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;

public class Example37 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.withCredentials("<clientId>", "<clientSecret>")
            .url("https://api.fern.com")
            .build()
        ;

        client.endpoints().primitive().getAndReturnDate("2023-01-15");
    }
}