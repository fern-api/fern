package com.snippets;

import com.seed.objects.with.imports.SeedObjectsWithImportsClient;
import java.util.HashMap;
import java.util.Optional;

public class Example0 {
    public static void run() {
        SeedObjectsWithImportsClient client = SeedObjectsWithImportsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.optional().sendOptionalBody(
            Optional.of(
                new HashMap<String, Object>() {{
                    put("string", new 
                    HashMap<String, Object>() {{put("key", "value");
                    }});
                }}
            )
        );
    }
}