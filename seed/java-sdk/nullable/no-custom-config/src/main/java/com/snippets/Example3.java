package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.nullable.requests.NullableCreateUserRequest;
import com.seed.api.types.Metadata;
import com.seed.api.types.Status;
import com.seed.api.types.StatusActive;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.nullable()
                .createuser(NullableCreateUserRequest.builder()
                        .username("username")
                        .tags(Optional.of(Arrays.asList("tags", "tags")))
                        .metadata(Metadata.builder()
                                .createdAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .updatedAt(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                                .status(Status.active(StatusActive.builder().build()))
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
