package com.snippets;

import com.seed.idempotency.headers.SeedIdempotencyHeadersClient;

public class Example1 {
    public static void run() {
        SeedIdempotencyHeadersClient client = SeedIdempotencyHeadersClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.payment().delete("paymentId");
    }
}