package com.snippets;

import com.seed.package.yml.SeedPackageYmlClient;
import com.seed.package.yml.types.EchoRequest;

public class Example1 {
    public static void run() {
        SeedPackageYmlClient client = SeedPackageYmlClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.echo(
            "id",
            EchoRequest
                .builder()
                .name("name")
                .size(1)
                .build()
        );
    }
}