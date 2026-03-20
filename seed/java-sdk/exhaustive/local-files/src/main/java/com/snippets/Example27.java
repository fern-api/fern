package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.types.object.types.ObjectWithDatetimeLikeString;
import java.time.OffsetDateTime;

public class Example27 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().getAndReturnWithDatetimeLikeString(
            ObjectWithDatetimeLikeString
                .builder()
                .datetimeLikeString("datetimeLikeString")
                .actualDatetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .build()
        );
    }
}