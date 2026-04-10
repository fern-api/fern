package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullableoptional.requests.NullableOptionalUpdateTagsRequest;

public class Example22 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullableoptional()
                .updatetags(
                        "userId", NullableOptionalUpdateTagsRequest.builder().build());
    }
}
