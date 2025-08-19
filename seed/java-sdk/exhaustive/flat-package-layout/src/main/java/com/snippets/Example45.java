package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.types.types.Animal;
import com.seed.exhaustive.types.types.Dog;

public class Example45 {
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