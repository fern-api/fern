package com.snippets;

import com.seed.stagedBuilderOrdering.SeedStagedBuilderOrderingClient;
import com.seed.stagedBuilderOrdering.resources.types.types.MixedStaged;
import com.seed.stagedBuilderOrdering.resources.types.types.SimpleStaged;
import java.time.OffsetDateTime;
import java.util.UUID;

public class Example11 {
    public static void main(String[] args) {
        SeedStagedBuilderOrderingClient client = SeedStagedBuilderOrderingClient.builder()
                .url("https://api.fern.com")
                .build();

        client.service()
                .createMixed(MixedStaged.builder()
                        .id(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                        .name("test")
                        .timestamp(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .nested(SimpleStaged.builder()
                                .first("a")
                                .second("b")
                                .third("c")
                                .build())
                        .count(42)
                        .build());
    }
}
