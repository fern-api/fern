package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.TypesObjectWithDatetimeLikeString;
import java.time.OffsetDateTime;

public class Example52 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpointsObject()
                .endpointsObjectGetAndReturnWithDatetimeLikeString(TypesObjectWithDatetimeLikeString.builder()
                        .datetimeLikeString("datetimeLikeString")
                        .actualDatetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .build());
    }
}
