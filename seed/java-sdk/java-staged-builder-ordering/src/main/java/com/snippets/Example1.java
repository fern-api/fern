package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.SimpleStaged;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .createsimple(SimpleStaged.builder()
                        .first("first")
                        .second("second")
                        .third("third")
                        .build());
    }
}
