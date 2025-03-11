package com.snippets;

import com.seed.query.parameters.SeedQueryParametersClient;
import com.seed.query.parameters.resources.user.requests.GetUsersRequest;
import com.seed.query.parameters.resources.user.types.NestedUser;
import com.seed.query.parameters.resources.user.types.User;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.UUID;

public class Example0 {
    public static void run() {
        SeedQueryParametersClient client = SeedQueryParametersClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.user().getUsername(
            GetUsersRequest
                .builder()
                .limit(1)
                .id(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                .date("2023-01-15")
                .deadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .bytes("SGVsbG8gd29ybGQh".getBytes())
                .user(
                    User
                        .builder()
                        .name("name")
                        .tags(
                            new ArrayList<String>(
                                Arrays.asList("tags", "tags")
                            )
                        )
                        .build()
                )
                .userList(
                    new ArrayList<User>(
                        Arrays.asList(
                            User
                                .builder()
                                .name("name")
                                .tags(
                                    new ArrayList<String>(
                                        Arrays.asList("tags", "tags")
                                    )
                                )
                                .build(),
                            User
                                .builder()
                                .name("name")
                                .tags(
                                    new ArrayList<String>(
                                        Arrays.asList("tags", "tags")
                                    )
                                )
                                .build()
                        )
                    )
                )
                .optionalDeadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .keyValue(
                    new HashMap<String, String>() {{
                        put("keyValue", "keyValue");
                    }}
                )
                .optionalString("optionalString")
                .nestedUser(
                    NestedUser
                        .builder()
                        .name("name")
                        .user(
                            User
                                .builder()
                                .name("name")
                                .tags(
                                    new ArrayList<String>(
                                        Arrays.asList("tags", "tags")
                                    )
                                )
                                .build()
                        )
                        .build()
                )
                .optionalUser(
                    User
                        .builder()
                        .name("name")
                        .tags(
                            new ArrayList<String>(
                                Arrays.asList("tags", "tags")
                            )
                        )
                        .build()
                )
                .excludeUser(
                    new ArrayList<User>(
                        Arrays.asList(
                            User
                                .builder()
                                .name("name")
                                .tags(
                                    new ArrayList<String>(
                                        Arrays.asList("tags", "tags")
                                    )
                                )
                                .build()
                        )
                    )
                )
                .filter(
                    new ArrayList<String>(
                        Arrays.asList("filter")
                    )
                )
                .build()
        );
    }
}