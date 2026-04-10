package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.Shape;
import com.seed.api.types.ShapeZero;
import com.seed.api.types.ShapeZeroType;

public class Example8 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.union()
                .update(Shape.of(ShapeZero.builder()
                        .radius(1.1)
                        .type(ShapeZeroType.CIRCLE)
                        .build()));
    }
}
