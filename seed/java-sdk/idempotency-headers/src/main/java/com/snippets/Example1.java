package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.payment.requests.PaymentCreateRequest;
import com.seed.api.types.Currency;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.payment()
                .create(PaymentCreateRequest.builder()
                        .amount(1)
                        .currency(Currency.USD)
                        .build());
    }
}
