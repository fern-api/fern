package com.snippets;

import com.seed.mixedCase.SeedMixedCaseClient;

public class Example1 {
    public static void main(String[] args) {
        SeedMixedCaseClient client = SeedMixedCaseClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().getResource("ResourceID");
    }
}