package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.user.requests.UserGetUsernameRequest;
import com.seed.api.types.NestedUser;
import com.seed.api.types.User;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.user()
                .getusername(UserGetUsernameRequest.builder()
                        .limit(1)
                        .id("id")
                        .date("2023-01-15")
                        .deadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .bytes("bytes")
                        .user(User.builder()
                                .name("name")
                                .tags(Arrays.asList("tags", "tags"))
                                .build())
                        .nestedUser(NestedUser.builder()
                                .name("name")
                                .user(User.builder()
                                        .name("name")
                                        .tags(Arrays.asList("tags", "tags"))
                                        .build())
                                .build())
                        .userList(Arrays.asList(User.builder()
                                .name("name")
                                .tags(Arrays.asList("tags", "tags"))
                                .build()))
                        .keyValue(new HashMap<String, String>() {
                            {
                                put("keyValue", "keyValue");
                            }
                        })
                        .excludeUser(Arrays.asList(User.builder()
                                .name("name")
                                .tags(Arrays.asList("tags", "tags"))
                                .build()))
                        .filter(Arrays.asList("filter"))
                        .optionalDeadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .optionalString("optionalString")
                        .optionalUser(User.builder()
                                .name("name")
                                .tags(Arrays.asList("tags", "tags"))
                                .build())
                        .build());
    }
}
