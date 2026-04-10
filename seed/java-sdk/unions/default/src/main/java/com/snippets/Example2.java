package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.BigUnion;
import com.seed.api.types.BigUnionZero;
import com.seed.api.types.BigUnionZeroType;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.bigunion()
                .update(BigUnion.of(BigUnionZero.builder()
                        .value("value")
                        .type(BigUnionZeroType.NORMAL_SWEET)
                        .build()));
    }
}
