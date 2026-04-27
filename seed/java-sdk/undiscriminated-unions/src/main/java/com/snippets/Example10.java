package com.snippets;

import com.seed.undiscriminatedUnions.SeedUndiscriminatedUnionsClient;
import com.seed.undiscriminatedUnions.resources.union.types.AliasedObjectUnion;
import com.seed.undiscriminatedUnions.resources.union.types.LeafObjectA;

public class Example10 {
    public static void main(String[] args) {
        SeedUndiscriminatedUnionsClient client = SeedUndiscriminatedUnionsClient.builder()
                .url("https://api.fern.com")
                .build();

        client.union()
                .aliasedObjectUnion(AliasedObjectUnion.of(
                        LeafObjectA.builder().onlyInA("onlyInA").sharedNumber(1).build()));
    }
}
