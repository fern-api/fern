package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.types.types.ObjectWithDatetimeLikeString;
import java.time.OffsetDateTime;

public class Example31 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .object()
                .getAndReturnWithDatetimeLikeString(ObjectWithDatetimeLikeString.builder()
                        .datetimeLikeString("datetimeLikeString")
                        .actualDatetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .build());
    }
}
