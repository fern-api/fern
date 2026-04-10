package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesAnimal;
import com.fern.sdk.types.TypesAnimalZero;
import com.fern.sdk.types.TypesAnimalZeroAnimal;

public class Example96 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsUnion().endpointsUnionGetAndReturnUnion(
            TypesAnimal.of(
                TypesAnimalZero
                    .builder()
                    .name("name")
                    .likesToWoof(true)
                    .animal(TypesAnimalZeroAnimal.DOG)
                    .build()
            )
        );
    }
}