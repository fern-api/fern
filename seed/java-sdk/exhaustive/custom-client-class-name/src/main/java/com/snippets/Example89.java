package com.snippets;

import com.seed.api.Best;
import java.time.OffsetDateTime;

public class Example89 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints().primitive().getAndReturnDatetime(OffsetDateTime.parse("2024-01-15T09:30:00Z"));
    }
}
