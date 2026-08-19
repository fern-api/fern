package com.snippets;

import com.seed.objectsWithImports.SeedObjectsWithImportsClient;
import com.seed.objectsWithImports.resources.optional.types.SendOptionalBodyRequest;
import java.util.Optional;

public class Example1 {
    public static void main(String[] args) {
        SeedObjectsWithImportsClient client = SeedObjectsWithImportsClient.builder()
                .url("https://api.fern.com")
                .build();

        client.optional()
                .sendOptionalTypedBody(Optional.of(
                        SendOptionalBodyRequest.builder().message("message").build()));
    }
}
