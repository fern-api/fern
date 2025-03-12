package com.snippets;

import com.seed.extends.SeedExtendsClient;
import com.seed.extends.requests.Inlined;

public class Example0 {
    public static void run() {
        SeedExtendsClient client = SeedExtendsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.extendedInlineRequestBody(
            Inlined
                .builder()
                .docs("docs")
                .name("name")
                .unique("unique")
                .build()
        );
    }
}