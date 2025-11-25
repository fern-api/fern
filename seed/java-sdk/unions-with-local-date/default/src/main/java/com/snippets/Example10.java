package com.snippets;

import com.seed.unions.SeedUnionsClient;
import com.seed.unions.resources.union.types.Circle;
import com.seed.unions.resources.union.types.Shape;

public class Example10 {
    public static void main(String[] args) {
        SeedUnionsClient client =
                SeedUnionsClient.builder().url("https://api.fern.com").build();

        client.union().update(Shape.circle(Circle.builder().radius(1.1).build()));
    }
}
