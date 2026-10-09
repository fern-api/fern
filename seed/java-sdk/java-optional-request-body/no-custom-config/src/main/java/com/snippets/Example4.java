package com.snippets;

import com.seed.javaOptionalRequestBody.SeedJavaOptionalRequestBodyClient;
import com.seed.javaOptionalRequestBody.types.RefundRequest;

public class Example4 {
    public static void main(String[] args) {
        SeedJavaOptionalRequestBodyClient client = SeedJavaOptionalRequestBodyClient.builder()
                .url("https://api.fern.com")
                .build();

        client.requiredRefund("id", RefundRequest.builder().amount(1.1).build());
    }
}
