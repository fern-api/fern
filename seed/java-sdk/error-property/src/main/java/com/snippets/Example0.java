package com.snippets;

import com.seed.errorProperty.SeedErrorPropertyClient;

public class Example0 {
    public static void run() {
        SeedErrorPropertyClient client = SeedErrorPropertyClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.propertyBasedError().throwError();
    }
}