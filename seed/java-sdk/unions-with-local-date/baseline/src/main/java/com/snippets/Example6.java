package com.snippets;

import com.seed.unions.SeedUnionsClient;
import com.seed.unions.resources.types.types.UnionWithTime;

public class Example6 {
    public static void main(String[] args) {
        SeedUnionsClient client =
                SeedUnionsClient.builder().url("https://api.fern.com").build();

        client.types().update(UnionWithTime.date("1994-01-01"));
    }
}
