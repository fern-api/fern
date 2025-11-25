package com.snippets;

import com.seed.nullable.SeedNullableClient;
import com.seed.nullable.resources.nullable.requests.GetUsersRequest;
import java.util.Arrays;
import java.util.Optional;

public class Example0 {
    public static void main(String[] args) {
        SeedNullableClient client =
                SeedNullableClient.builder().url("https://api.fern.com").build();

        client.nullable()
                .getUsers(GetUsersRequest.builder()
                        .usernames(Arrays.asList("usernames"))
                        .activated(Arrays.asList(true))
                        .tags(Arrays.asList(Optional.of("tags")))
                        .avatar("avatar")
                        .extra(true)
                        .build());
    }
}
