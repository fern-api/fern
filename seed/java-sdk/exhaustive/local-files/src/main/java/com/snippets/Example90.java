package com.snippets;

import com.fern.sdk.SeedApiClient;
import java.time.OffsetDateTime;

public class Example90 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().primitive().getAndReturnDatetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"));
    }
}