package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.user.requests.UserCreateUsernameRequest;
import java.util.Arrays;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.user()
                .createusername(UserCreateUsernameRequest.builder()
                        .username("username")
                        .password("password")
                        .name("name")
                        .tags(Arrays.asList("tags"))
                        .build());
    }
}
