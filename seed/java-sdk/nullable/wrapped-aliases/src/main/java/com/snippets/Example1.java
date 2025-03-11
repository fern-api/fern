package com.snippets;

import com.seed.nullable.SeedNullableClient;
import com.seed.nullable.resources.nullable.requests.CreateUserRequest;
import com.seed.nullable.resources.nullable.types.Metadata;
import com.seed.nullable.resources.nullable.types.Status;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;

public class Example1 {
    public static void run() {
        SeedNullableClient client = SeedNullableClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.nullable().createUser(
            CreateUserRequest
                .builder()
                .username("username")
                .tags(
                    new ArrayList<String>(
                        Arrays.asList("tags", "tags")
                    )
                )
                .metadata(
                    Metadata
                        .builder()
                        .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .updatedAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .avatar("avatar")
                        .status(
                            Status.active()
                        )
                        .activated(true)
                        .build()
                )
                .avatar("avatar")
                .build()
        );
    }
}