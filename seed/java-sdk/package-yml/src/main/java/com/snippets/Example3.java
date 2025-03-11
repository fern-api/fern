package com.snippets;

import com.seed.package.yml.SeedPackageYmlClient;

public class Example3 {
    public static void run() {
        SeedPackageYmlClient client = SeedPackageYmlClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().nop("id", "nestedId");
    }
}