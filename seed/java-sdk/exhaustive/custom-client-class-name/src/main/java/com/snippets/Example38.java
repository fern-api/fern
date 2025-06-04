package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.endpoints.put.requests.PutRequest;

public class Example38 {
    public static void main(String[] args) {
        Best client = Best
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().put().add(
            PutRequest
                .builder()
                .id("id")
                .build()
        );
    }
}