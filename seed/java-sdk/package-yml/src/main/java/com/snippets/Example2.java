package com.snippets;

import com.seed.packageYml.SeedPackageYmlClient;

public class Example2 {
    public static void main(String[] args) {
        SeedPackageYmlClient client = SeedPackageYmlClient.builder()
                .url("https://api.fern.com")
                .id("id-a2ijs82")
                .build();

        client.service().nop("id-219xca8");
    }
}
