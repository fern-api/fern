package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.PaymentRequest;

public class Example12 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .build();

        client.createPayment(
            PaymentRequest
                .builder()
                .amount(1.1)
                .currency("currency")
                .recipient("recipient")
                .build()
        );
    }
}