package com.snippets;

import com.seed.undiscriminatedUnionWithResponseProperty.SeedUndiscriminatedUnionWithResponsePropertyClient;

public class Example0 {
    public static void main(String[] args) {
        SeedUndiscriminatedUnionWithResponsePropertyClient client =
                SeedUndiscriminatedUnionWithResponsePropertyClient.builder()
                        .url("https://api.fern.com")
                        .build();

        client.getUnion();
    }
}
