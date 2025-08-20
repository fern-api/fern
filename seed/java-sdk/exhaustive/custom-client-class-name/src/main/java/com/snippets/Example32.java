package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.endpoints.params.requests.GetWithPathAndQuery;

public class Example32 {
    public static void main(String[] args) {
        Best client = Best
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().params().getWithPathAndQuery(
            "param",
            GetWithPathAndQuery
                .builder()
                .query("query")
                .build()
        );
    }
}