package com.snippets;

import com.seed.packageYml.SeedPackageYmlClient;
import com.seed.packageYml.types.EchoRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedPackageYmlClient client = SeedPackageYmlClient.builder()
                .url("https://api.fern.com")
                .id("id")
                .build();

        client.echo(EchoRequest.builder().name("name").size(1).build());
    }
}
