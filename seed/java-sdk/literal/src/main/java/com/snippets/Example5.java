package com.snippets;

import com.seed.literal.SeedLiteralClient;

public class Example5 {
    public static void main(String[] args) {
        SeedLiteralClient client =
                SeedLiteralClient.builder().url("https://api.fern.com").build();

        client.path().send("123");
    }
}
