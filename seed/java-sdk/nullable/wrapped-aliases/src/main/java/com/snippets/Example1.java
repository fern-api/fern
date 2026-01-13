package com.snippets;

import com.seed.nullable.SeedNullableClient;
import com.seed.nullable.resources.nullable.requests.CreateUserRequest;
import com.seed.nullable.resources.nullable.types.Metadata;
import com.seed.nullable.resources.nullable.types.Status;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example1 {
    public static void main(String[] args) {
        SeedNullableClient client =
                SeedNullableClient.builder().url("https://api.fern.com").build();

        client.nullable()
                .createUser(CreateUserRequest.builder()
                        .username("username")
                        .tags(Optional.of(Arrays.asList("tags", "tags")))
                        .metadata(Metadata.builder()
                                .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .updatedAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .status(Status.active())
                                .avatar("avatar")
                                .activated(true)
                                .values(new HashMap<String, Optional<String>>() {
                                    {
                                        put("values", Optional.of("values"));
                                    }
                                })
                                .build())
                        .avatar("avatar")
                        .build());
    }
}
