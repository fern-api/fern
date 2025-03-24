package com.snippets;

import com.seed.packageYml.SeedPackageYmlClient;
import com.seed.packageYml.types.EchoRequest;

public class Example0 {
    public static void main(String[] args) {
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