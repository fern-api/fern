package com.snippets;

import com.seed.license.SeedLicenseClient;

public class Example0 {
    public static void run() {
        SeedLicenseClient client = SeedLicenseClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.get();
    }
}