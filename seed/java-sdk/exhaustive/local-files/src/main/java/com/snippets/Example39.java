package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.types.union.types.Animal;
import com.fern.sdk.resources.types.union.types.Dog;

public class Example39 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().union().getAndReturnUnion(
            Animal.dog(
                Dog
                    .builder()
                    .name("name")
                    .likesToWoof(true)
                    .build()
            )
        );
    }
}