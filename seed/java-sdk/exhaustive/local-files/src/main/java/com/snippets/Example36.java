package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import java.time.OffsetDateTime;

public class Example36 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.withCredentials("<clientId>", "<clientSecret>")
            .url("https://api.fern.com")
            .build()
        ;

        client.endpoints().primitive().getAndReturnDatetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"));
    }
}