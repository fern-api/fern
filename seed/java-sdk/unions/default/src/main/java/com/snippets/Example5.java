package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.BigUnion;
import com.seed.api.types.BigUnionZero;
import com.seed.api.types.BigUnionZeroType;
import java.util.Arrays;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.bigunion()
                .updateMany(Arrays.asList(
                        BigUnion.of(BigUnionZero.builder()
                                .value("value")
                                .type(BigUnionZeroType.NORMAL_SWEET)
                                .build()),
                        BigUnion.of(BigUnionZero.builder()
                                .value("value")
                                .type(BigUnionZeroType.NORMAL_SWEET)
                                .build())));
    }
}
