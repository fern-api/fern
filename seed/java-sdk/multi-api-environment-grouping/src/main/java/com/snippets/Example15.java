package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.RefundRequest;

public class Example15 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .build();

        client.refundPayment(
            "paymentId",
            RefundRequest
                .builder()
                .amount(1.1)
                .reason("reason")
                .build()
        );
    }
}