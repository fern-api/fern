package com.snippets;

import com.seed.exhaustive.Best;

public class Example31 {
    public static void run() {
        Best client = Best
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().primitive().getAndReturnLong(1000000L);
    }
}