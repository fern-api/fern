package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.MixedStaged;
import com.seed.api.types.SimpleStaged;
import java.time.OffsetDateTime;

public class Example7 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .createmixed(MixedStaged.builder()
                        .id("id")
                        .name("name")
                        .timestamp(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .nested(SimpleStaged.builder()
                                .first("first")
                                .second("second")
                                .third("third")
                                .build())
                        .count(1)
                        .build());
    }
}
