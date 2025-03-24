package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.types.union.types.Animal;
import com.seed.exhaustive.resources.types.union.types.Dog;

public class Example39 {
    public static void main(String[] args) {
        Best client = Best
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