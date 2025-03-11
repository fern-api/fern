package com.snippets;

import com.seed.custom.auth.SeedCustomAuthClient;

public class Example0 {
    public static void run() {
        SeedCustomAuthClient client = SeedCustomAuthClient
            .builder()
            .customAuthScheme("<value>")
            .url("https://api.fern.com")
            .build();

        client.customAuth().getWithCustomAuth();
    }
}