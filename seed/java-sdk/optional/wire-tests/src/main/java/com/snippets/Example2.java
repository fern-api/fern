package com.snippets;

import com.seed.objectsWithImports.SeedObjectsWithImportsClient;
import com.seed.objectsWithImports.resources.optional.types.DeployParams;
import java.util.Optional;

public class Example2 {
    public static void main(String[] args) {
        SeedObjectsWithImportsClient client = SeedObjectsWithImportsClient.builder()
                .url("https://api.fern.com")
                .build();

        client.optional()
                .sendOptionalNullableWithAllOptionalProperties(
                        "actionId",
                        "id",
                        Optional.of(DeployParams.builder().updateDraft(true).build()));
    }
}
