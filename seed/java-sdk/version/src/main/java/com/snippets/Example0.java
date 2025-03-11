package com.snippets;

import com.seed.version.SeedVersionClient;

public class Example0 {
    public static void run() {
        SeedVersionClient client = SeedVersionClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.user().getUser("userId");
    }
}