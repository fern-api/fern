package com.snippets;

import com.seed.api.SeedApiClient;
import java.time.OffsetDateTime;

public class Example86 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsPrimitive()
                .endpointsPrimitiveGetAndReturnDatetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"));
    }
}
