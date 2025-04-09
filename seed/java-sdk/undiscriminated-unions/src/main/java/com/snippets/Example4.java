package com.snippets;

import com.seed.undiscriminatedUnions.SeedUndiscriminatedUnionsClient;
import com.seed.undiscriminatedUnions.resources.union.types.MetadataUnion;
import com.seed.undiscriminatedUnions.resources.union.types.Request;
import java.util.HashMap;

public class Example4 {
    public static void main(String[] args) {
        SeedUndiscriminatedUnionsClient client = SeedUndiscriminatedUnionsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.union().call(
            Request
                .builder()
                .union(
                    MetadataUnion.ofOptionalMetadata(
                        new HashMap<String, Object>() {{
                            put("union", new 
                            HashMap<String, Object>() {{put("key", "value");
                            }});
                        }}
                    )
                )
                .build()
        );
    }
}