package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;

public class Example39 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.withCredentials("<clientId>", "<clientSecret>")
            .url("https://api.fern.com")
            .build()
        ;

        client.endpoints().primitive().getAndReturnBase64("SGVsbG8gd29ybGQh".getBytes());
    }
}