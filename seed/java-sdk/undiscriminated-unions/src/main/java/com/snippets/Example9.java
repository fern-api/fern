package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.UnionWithDuplicateTypes;

public class Example9 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.union().duplicatetypesunion(UnionWithDuplicateTypes.of("string"));
    }
}
