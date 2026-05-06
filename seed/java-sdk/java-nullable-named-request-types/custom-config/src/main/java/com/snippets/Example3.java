package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.PostWithNonNullableNamedRequestBodyTypeRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.postWithNonNullableNamedRequestBodyType(
                "id",
                PostWithNonNullableNamedRequestBodyTypeRequest.builder()
                        .postWithNonNullableNamedRequestBodyTypeRequestId("id")
                        .name("name")
                        .age(1)
                        .build());
    }
}
