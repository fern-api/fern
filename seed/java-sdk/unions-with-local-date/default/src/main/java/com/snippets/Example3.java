package com.snippets;

import com.seed.unions.SeedApiClient;
import com.seed.unions.types.BigUnion;
import com.seed.unions.types.BigUnionZero;
import com.seed.unions.types.BigUnionZeroType;

public class Example3 {
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
