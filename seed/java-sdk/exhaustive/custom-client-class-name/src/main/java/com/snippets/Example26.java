package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.types.object.types.ObjectWithDatetimeLikeString;
import java.time.OffsetDateTime;

public class Example26 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .object()
                .getAndReturnWithDatetimeLikeString(ObjectWithDatetimeLikeString.builder()
                        .datetimeLikeString("datetimeLikeString")
                        .actualDatetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                        .build());
    }
}
