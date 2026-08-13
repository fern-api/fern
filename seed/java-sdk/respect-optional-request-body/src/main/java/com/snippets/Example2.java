package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.RequiredRefundRequest;
import com.seed.api.types.RefundRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.requiredRefund(
                "refund-id",
                RequiredRefundRequest.builder()
                        .body(RefundRequest.builder().amount(60.0).build())
                        .build());
    }
}
