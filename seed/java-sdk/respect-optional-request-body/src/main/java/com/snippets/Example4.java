package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.RefundRequest;

public class Example4 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.bulkRefund(RefundRequest.builder().build());
    }
}
