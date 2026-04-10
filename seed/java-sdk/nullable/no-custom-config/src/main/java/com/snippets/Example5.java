package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullable.requests.NullableDeleteUserRequest;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullable()
                .deleteuser(
                        NullableDeleteUserRequest.builder().username("username").build());
    }
}
