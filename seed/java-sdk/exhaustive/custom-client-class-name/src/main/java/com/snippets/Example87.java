package com.snippets;

import com.seed.api.Best;
import java.time.OffsetDateTime;

public class Example87 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsPrimitive()
                .endpointsPrimitiveGetAndReturnDatetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"));
    }
}
