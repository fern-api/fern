package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.user.requests.UserCreateUserRequest;
import com.seed.api.types.User;
import java.util.Arrays;

public class Example11 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.user()
                .createuser(
                        "tenant_id",
                        UserCreateUserRequest.builder()
                                .body(User.builder()
                                        .name("name")
                                        .tags(Arrays.asList("tags", "tags"))
                                        .build())
                                .build());
    }
}
