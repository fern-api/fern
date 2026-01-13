package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.UpdateFooRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.updateFoo(
            "id",
            UpdateFooRequest
                .builder()
                .xIdempotencyKey("X-Idempotency-Key")
                .nullableText("nullable_text")
                .nullableNumber(1.1)
                .nonNullableText("non_nullable_text")
                .build()
        );
    }
}