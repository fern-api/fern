package com.snippets;

import com.seed.idempotencyHeaders.SeedIdempotencyHeadersClient;
import com.seed.idempotencyHeaders.resources.payment.requests.CreatePaymentRequest;
import com.seed.idempotencyHeaders.resources.payment.types.Currency;

public class Example0 {
    public static void main(String[] args) {
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