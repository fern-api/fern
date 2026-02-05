package com.snippets;

import com.seed.unions.SeedUnionsClient;
import com.seed.unions.resources.bigunion.types.BigUnion;
import com.seed.unions.resources.bigunion.types.NormalSweet;
import java.util.Arrays;

public class Example2 {
    public static void main(String[] args) {
        SeedUnionsClient client =
                SeedUnionsClient.builder().url("https://api.fern.com").build();

        client.bigunion()
                .updateMany(Arrays.asList(
                        BigUnion.normalSweet(
                                NormalSweet.builder().value("value").build()),
                        BigUnion.normalSweet(
                                NormalSweet.builder().value("value").build())));
    }
}
