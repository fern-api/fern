package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.BasicType;
import com.seed.api.types.Type;

public class Example21 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.createType(Type.of(BasicType.PRIMITIVE));
    }
}
