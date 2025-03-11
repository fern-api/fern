package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.resources.types.union.types.Animal;
import com.seed.exhaustive.resources.types.union.types.Dog;

public class Example38 {
    public static void run() {
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