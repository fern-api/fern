package com.snippets;

import com.seed.customAuth.SeedCustomAuthClient;

public class Example2 {
    public static void main(String[] args) {
        SeedCustomAuthClient client = SeedCustomAuthClient
            .builder()
            .customAuthScheme("<value>")
            .url("https://api.fern.com")
            .build();

        client.customAuth().getWithCustomAuth();
    }
}