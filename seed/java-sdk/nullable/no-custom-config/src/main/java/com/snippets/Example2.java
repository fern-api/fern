package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullable.requests.NullableCreateUserRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullable()
                .createuser(
                        NullableCreateUserRequest.builder().username("username").build());
    }
}
