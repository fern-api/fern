package com.snippets;

import com.seed.undiscriminatedUnions.SeedUndiscriminatedUnionsClient;
import com.seed.undiscriminatedUnions.resources.union.types.MetadataUnion;
import java.util.HashMap;

public class Example3 {
    public static void main(String[] args) {
        SeedUndiscriminatedUnionsClient client = SeedUndiscriminatedUnionsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.union().updateMetadata(
            MetadataUnion.ofOptionalMetadata(
                new HashMap<String, Object>() {{
                    put("string", new 
                    HashMap<String, Object>() {{put("key", "value");
                    }});
                }}
            )
        );
    }
}