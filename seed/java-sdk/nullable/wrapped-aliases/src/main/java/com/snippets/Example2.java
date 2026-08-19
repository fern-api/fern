package com.snippets;

import com.seed.nullable.SeedNullableClient;
import com.seed.nullable.resources.nullable.requests.DeleteUserRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedNullableClient client =
                SeedNullableClient.builder().url("https://api.fern.com").build();

        client.nullable().deleteUser(DeleteUserRequest.builder().username("xy").build());
    }
}
