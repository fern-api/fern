package com.snippets;

import com.seed.packageYml.SeedPackageYmlClient;

public class Example3 {
    public static void main(String[] args) {
        SeedPackageYmlClient client = SeedPackageYmlClient.builder()
                .url("https://api.fern.com")
                .id("id")
                .build();

        client.service().nop("nestedId");
    }
}
