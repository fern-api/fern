package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.endpoints.params.requests.GetWithQuery;

public class Example23 {
    public static void run() {
        Best client = Best
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().getWithQuery(
            GetWithQuery
                .builder()
                .query("query")
                .number(1)
                .build()
        );
    }
}