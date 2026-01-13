package com.snippets;

import com.seed.idempotencyHeaders.SeedIdempotencyHeadersClient;

public class Example1 {
    public static void main(String[] args) {
        SeedIdempotencyHeadersClient client = SeedIdempotencyHeadersClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.payment().delete("paymentId");
    }
}