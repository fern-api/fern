package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.Root;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.repro(Root.builder()
                .id(1)
                .otherField("other_field")
                .uniqueField("unique_field")
                .build());
    }
}
