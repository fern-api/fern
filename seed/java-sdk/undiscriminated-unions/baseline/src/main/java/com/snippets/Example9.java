package com.snippets;

import com.seed.undiscriminatedUnions.SeedUndiscriminatedUnionsClient;
import com.seed.undiscriminatedUnions.resources.union.types.OuterNestedUnion;

public class Example9 {
    public static void main(String[] args) {
        SeedUndiscriminatedUnionsClient client = SeedUndiscriminatedUnionsClient.builder()
                .url("https://api.fern.com")
                .build();

        client.union().nestedObjectUnions(OuterNestedUnion.of("string"));
    }
}
