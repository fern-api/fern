package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesObjectWithDatetimeLikeString;
import java.time.OffsetDateTime;

public class Example53 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsObject().endpointsObjectGetAndReturnWithDatetimeLikeString(
            TypesObjectWithDatetimeLikeString
                .builder()
                .datetimeLikeString("datetimeLikeString")
                .actualDatetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .build()
        );
    }
}