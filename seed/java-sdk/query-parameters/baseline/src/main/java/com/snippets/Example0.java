package com.snippets;

import com.seed.queryParameters.SeedQueryParametersClient;
import com.seed.queryParameters.resources.user.requests.GetUsersRequest;
import com.seed.queryParameters.resources.user.types.NestedUser;
import com.seed.queryParameters.resources.user.types.User;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.UUID;

public class Example0 {
    public static void main(String[] args) {
        SeedQueryParametersClient client =
                SeedQueryParametersClient.builder().url("https://api.fern.com").build();

        client.user()
                .getUsername(GetUsersRequest.builder()
                        .limit(1)
                        .id(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                        .date("2023-01-15")
                        .deadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .bytes("SGVsbG8gd29ybGQh".getBytes())
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
                        .userList(Arrays.asList(
                                User.builder()
                                        .name("name")
                                        .tags(Arrays.asList("tags", "tags"))
                                        .build(),
                                User.builder()
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
