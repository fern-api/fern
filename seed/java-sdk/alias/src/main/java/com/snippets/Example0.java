package com.snippets;

import com.seed.alias.SeedAliasClient;

public class Example0 {
    public static void main(String[] args) {
        SeedAliasClient client = SeedAliasClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.get("typeId");
    }
}