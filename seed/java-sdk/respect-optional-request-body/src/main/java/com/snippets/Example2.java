package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.RefundBody;
import com.seed.api.types.RefundRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.refund(
                "id",
                RefundBody.builder()
                        .body(RefundRequest.builder().amount(1.1).build())
                        .build());
    }
}
