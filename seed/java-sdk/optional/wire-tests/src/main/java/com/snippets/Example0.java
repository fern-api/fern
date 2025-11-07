package com.snippets;

import com.seed.objectsWithImports.SeedObjectsWithImportsClient;
import java.util.HashMap;
import java.util.Optional;

public class Example0 {
    public static void main(String[] args) {
        SeedObjectsWithImportsClient client = SeedObjectsWithImportsClient.builder()
                .url("https://api.fern.com")
                .build();

        client.optional().sendOptionalBody(Optional.of(new HashMap<String, Object>() {
            {
                put("string", new HashMap<String, Object>() {
                    {
                        put("key", "value");
                    }
                });
            }
        }));
    }
}
