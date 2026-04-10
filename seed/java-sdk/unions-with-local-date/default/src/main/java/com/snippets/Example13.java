package com.snippets;

import com.seed.unions.SeedApiClient;
import com.seed.unions.types.Shape;
import com.seed.unions.types.ShapeZero;
import com.seed.unions.types.ShapeZeroType;

public class Example13 {
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
