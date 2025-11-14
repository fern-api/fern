package com.snippets;

import com.seed.unions.SeedUnionsClient;

public class Example0 {
    public static void main(String[] args) {
        SeedUnionsClient client =
                SeedUnionsClient.builder().url("https://api.fern.com").build();

        client.bigunion().get("id");
    }
}
