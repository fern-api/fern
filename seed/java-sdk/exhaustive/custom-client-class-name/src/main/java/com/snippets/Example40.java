package com.snippets;

import com.seed.exhaustive.Best;

public class Example40 {
    public static void main(String[] args) {
        Best client = Best
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().urls().withMixedCase();
    }
}