package com.snippets;

import com.seed.javaOptionalRequestBody.SeedJavaOptionalRequestBodyClient;
import com.seed.javaOptionalRequestBody.requests.RefundWithHeaderRequest;
import com.seed.javaOptionalRequestBody.types.RefundRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedJavaOptionalRequestBodyClient client = SeedJavaOptionalRequestBodyClient.builder()
                .url("https://api.fern.com")
                .build();

        client.refundWithHeader(RefundWithHeaderRequest.builder()
                .body(RefundRequest.builder().amount(1.1).build())
                .xIdempotencyKey("X-Idempotency-Key")
                .build());
    }
}
