package com.snippets;

import com.seed.javaOptionalRequestBody.SeedJavaOptionalRequestBodyClient;
import com.seed.javaOptionalRequestBody.types.ExactRefundRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedJavaOptionalRequestBodyClient client = SeedJavaOptionalRequestBodyClient.builder()
                .url("https://api.fern.com")
                .build();

        client.refundExactAmount("id", ExactRefundRequest.builder().amount(1.1).build());
    }
}
