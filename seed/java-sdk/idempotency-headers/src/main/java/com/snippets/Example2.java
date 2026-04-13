package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.payment.requests.PaymentDeleteRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.payment().delete("paymentId", PaymentDeleteRequest.builder().build());
    }
}
