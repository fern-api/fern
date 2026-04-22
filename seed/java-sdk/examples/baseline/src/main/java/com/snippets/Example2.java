package com.snippets;

import com.seed.examples.SeedExamplesClient;
import com.seed.examples.types.BasicType;
import com.seed.examples.types.Type;

public class Example2 {
    public static void main(String[] args) {
        SeedExamplesClient client = SeedExamplesClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.createType(Type.of(BasicType.PRIMITIVE));
    }
}
