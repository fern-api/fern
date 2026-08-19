package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.RootObject;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.createTest(RootObject.builder()
                .normalField("normalField")
                .nullableField("nullableField")
                .build());
    }
}
