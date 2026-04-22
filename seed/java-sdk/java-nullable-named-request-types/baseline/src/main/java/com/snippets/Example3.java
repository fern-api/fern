package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.NonNullableObject;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.postWithNonNullableNamedRequestBodyType(
                "id",
                NonNullableObject.builder()
                        .nonNullableObjectId("id")
                        .name("name")
                        .age(1)
                        .build());
    }
}
