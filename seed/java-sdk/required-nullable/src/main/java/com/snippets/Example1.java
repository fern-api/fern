package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.GetFooRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.getFoo(GetFooRequest.builder()
                .requiredBaz("required_baz")
                .requiredNullableBaz("required_nullable_baz")
                .optionalBaz("optional_baz")
                .optionalNullableBaz("optional_nullable_baz")
                .build());
    }
}
