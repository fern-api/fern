package com.snippets;

import com.seed.error.property.SeedErrorPropertyClient;

public class Example0 {
    public static void run() {
        SeedErrorPropertyClient client = SeedErrorPropertyClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.propertyBasedError().throwError();
    }
}