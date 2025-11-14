package com.snippets;

import com.seed.unions.SeedUnionsClient;
import com.seed.unions.resources.bigunion.types.BigUnion;
import com.seed.unions.resources.bigunion.types.NormalSweet;

public class Example1 {
    public static void main(String[] args) {
        SeedUnionsClient client =
                SeedUnionsClient.builder().url("https://api.fern.com").build();

        client.bigunion()
                .update(BigUnion.normalSweet(
                        NormalSweet.builder().value("value").build()));
    }
}
