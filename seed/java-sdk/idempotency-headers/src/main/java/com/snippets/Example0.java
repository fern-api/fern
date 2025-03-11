package com.snippets;

import com.seed.idempotency.headers.SeedIdempotencyHeadersClient;
import com.seed.idempotency.headers.resources.payment.requests.CreatePaymentRequest;
import com.seed.idempotency.headers.resources.payment.types.Currency;

public class Example0 {
    public static void run() {
        SeedIdempotencyHeadersClient client = SeedIdempotencyHeadersClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.payment().create(
            CreatePaymentRequest
                .builder()
                .amount(1)
                .currency(Currency.USD)
                .build()
        );
    }
}