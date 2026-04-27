package com.snippets;

import com.seed.undiscriminatedUnions.SeedUndiscriminatedUnionsClient;
import com.seed.undiscriminatedUnions.resources.union.types.NamedMetadata;
import com.seed.undiscriminatedUnions.resources.union.types.UnionWithBaseProperties;
import java.util.HashMap;

public class Example11 {
    public static void main(String[] args) {
        SeedUndiscriminatedUnionsClient client = SeedUndiscriminatedUnionsClient.builder()
                .url("https://api.fern.com")
                .build();

        client.union()
                .getWithBaseProperties(UnionWithBaseProperties.of(NamedMetadata.builder()
                        .name("name")
                        .value(new HashMap<String, Object>() {
                            {
                                put("value", new HashMap<String, Object>() {
                                    {
                                        put("key", "value");
                                    }
                                });
                            }
                        })
                        .build()));
    }
}
