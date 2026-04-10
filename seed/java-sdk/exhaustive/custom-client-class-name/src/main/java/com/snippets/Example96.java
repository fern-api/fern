package com.snippets;

import com.seed.api.Best;
import com.seed.api.types.TypesAnimal;
import com.seed.api.types.TypesAnimalZero;
import com.seed.api.types.TypesAnimalZeroAnimal;

public class Example96 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsUnion()
                .endpointsUnionGetAndReturnUnion(TypesAnimal.of(TypesAnimalZero.builder()
                        .name("name")
                        .likesToWoof(true)
                        .animal(TypesAnimalZeroAnimal.DOG)
                        .build()));
    }
}
