package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.SearchRequest;
import com.seed.api.types.NestedUser;
import com.seed.api.types.SearchRequestNeighborRequired;
import com.seed.api.types.User;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.search(
            SearchRequest
                .builder()
                .limit(1)
                .id("id")
                .date("date")
                .deadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .bytes("bytes")
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
                    new ArrayList<Optional<User>>(
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
                .excludeUser(
                    new ArrayList<Optional<User>>(
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
                    new ArrayList<Optional<String>>(
                        Arrays.asList("filter")
                    )
                )
                .neighborRequired(
                    SearchRequestNeighborRequired.ofUser(
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
                .optionalDeadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .keyValue(
                    new HashMap<String, Optional<String>>() {{
                        put("keyValue", Optional.of("keyValue"));
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
                .neighbor(
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
        );
    }
}