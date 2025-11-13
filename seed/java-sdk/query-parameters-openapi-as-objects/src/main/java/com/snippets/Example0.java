package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.SearchRequest;
import com.seed.api.types.NestedUser;
import com.seed.api.types.SearchRequestNeighbor;
import com.seed.api.types.SearchRequestNeighborRequired;
import com.seed.api.types.User;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.search(SearchRequest.builder()
                .limit(1)
                .id("id")
                .date("2023-01-15")
                .deadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .bytes("bytes")
                .user(User.builder()
                        .name("name")
                        .tags(Optional.of(Arrays.asList("tags", "tags")))
                        .build())
                .neighborRequired(SearchRequestNeighborRequired.of(User.builder()
                        .name("name")
                        .tags(Optional.of(Arrays.asList("tags", "tags")))
                        .build()))
                .userList(Arrays.asList(Optional.of(User.builder()
                        .name("name")
                        .tags(Optional.of(Arrays.asList("tags", "tags")))
                        .build())))
                .excludeUser(Arrays.asList(Optional.of(User.builder()
                        .name("name")
                        .tags(Optional.of(Arrays.asList("tags", "tags")))
                        .build())))
                .filter(Arrays.asList(Optional.of("filter")))
                .optionalDeadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .keyValue(new HashMap<String, String>() {
                    {
                        put("keyValue", "keyValue");
                    }
                })
                .optionalString("optionalString")
                .nestedUser(NestedUser.builder()
                        .name("name")
                        .user(User.builder()
                                .name("name")
                                .tags(Optional.of(Arrays.asList("tags", "tags")))
                                .build())
                        .build())
                .optionalUser(User.builder()
                        .name("name")
                        .tags(Optional.of(Arrays.asList("tags", "tags")))
                        .build())
                .neighbor(SearchRequestNeighbor.of(User.builder()
                        .name("name")
                        .tags(Optional.of(Arrays.asList("tags", "tags")))
                        .build()))
                .build());
    }
}
