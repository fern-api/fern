package com.snippets;

import com.seed.literal.SeedLiteralClient;

public class Example3 {
    public static void main(String[] args) {
        SeedLiteralClient client =
                SeedLiteralClient.builder().url("https://api.fern.com").build();

        client.headers().sendLiteralsOnly();
    }
}
