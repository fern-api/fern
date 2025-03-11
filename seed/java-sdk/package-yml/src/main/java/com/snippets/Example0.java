package com.snippets;

import com.seed.package.yml.SeedPackageYmlClient;
import com.seed.package.yml.types.EchoRequest;

public class Example0 {
    public static void run() {
        SeedPackageYmlClient client = SeedPackageYmlClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.echo(
            "id-ksfd9c1",
            EchoRequest
                .builder()
                .name("Hello world!")
                .size(20)
                .build()
        );
    }
}