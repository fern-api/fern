package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.MyUnion;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.union().get(MyUnion.of("string"));
    }
}
