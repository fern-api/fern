package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.types.object.types.ObjectWithDatetimeLikeString;
import java.time.OffsetDateTime;

public class Example26 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().getAndReturnWithDatetimeLikeString(
            ObjectWithDatetimeLikeString
                .builder()
                .datetimeLikeString("2023-08-31T14:15:22Z")
                .actualDatetime(OffsetDateTime.parse("2023-08-31T14:15:22Z"))
                .build()
        );
    }
}