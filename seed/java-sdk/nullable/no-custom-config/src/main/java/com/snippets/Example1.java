package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullable.requests.NullableGetUsersRequest;
import java.util.Arrays;
import java.util.Optional;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullable()
                .getusers(NullableGetUsersRequest.builder()
                        .usernames(Arrays.asList(Optional.of("usernames")))
                        .activated(Arrays.asList(Optional.of(true)))
                        .tags(Arrays.asList(Optional.of("tags")))
                        .avatar("avatar")
                        .extra(true)
                        .build());
    }
}
