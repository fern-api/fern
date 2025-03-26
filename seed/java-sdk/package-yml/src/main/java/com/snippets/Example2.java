package com.snippets;

import com.seed.packageYml.SeedPackageYmlClient;

public class Example2 {
    public static void main(String[] args) {
        SeedPackageYmlClient client = SeedPackageYmlClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().nop("id-a2ijs82", "id-219xca8");
    }
}