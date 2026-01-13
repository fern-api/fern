package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.PostWithNullableNamedRequestBodyTypeRequest;
import com.seed.api.types.NullableObject;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.postWithNullableNamedRequestBodyType(
            "id",
            PostWithNullableNamedRequestBodyTypeRequest
                .builder()
                .body(
                    NullableObject
                        .builder()
                        .id("id")
                        .name("name")
                        .age(1)
                        .build()
                )
                .build()
        );
    }
}