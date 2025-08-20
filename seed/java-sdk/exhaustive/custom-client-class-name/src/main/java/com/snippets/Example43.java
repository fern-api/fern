package com.snippets;

import com.seed.exhaustive.Best;

public class Example43 {
    public static void main(String[] args) {
        Best client = Best
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().primitive().getAndReturnBase64("SGVsbG8gd29ybGQh".getBytes());
    }
}