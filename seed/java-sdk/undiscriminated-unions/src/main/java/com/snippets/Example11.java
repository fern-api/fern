package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.NestedUnionRoot;

public class Example11 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.union().nestedunions(NestedUnionRoot.of("string"));
    }
}
