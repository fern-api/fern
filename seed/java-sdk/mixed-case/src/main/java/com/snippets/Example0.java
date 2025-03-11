package com.snippets;

import com.seed.mixed.case.SeedMixedCaseClient;

public class Example0 {
    public static void run() {
        SeedMixedCaseClient client = SeedMixedCaseClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().getResource("rsc-xyz");
    }
}