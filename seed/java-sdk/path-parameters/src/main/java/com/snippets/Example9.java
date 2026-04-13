package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.user.requests.UserUpdateUserRequest;
import com.seed.api.types.User;
import java.util.Arrays;

public class Example9 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.user()
                .updateuser(
                        "tenant_id",
                        "user_id",
                        UserUpdateUserRequest.builder()
                                .body(User.builder()
                                        .name("name")
                                        .tags(Arrays.asList("tags", "tags"))
                                        .build())
                                .build());
    }
}
