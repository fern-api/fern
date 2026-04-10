package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.MetadataUnion;
import java.util.HashMap;
import java.util.Optional;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.union().updatemetadata(MetadataUnion.of(Optional.of(new HashMap<String, Object>() {
            {
                put("string", new HashMap<String, Object>() {
                    {
                        put("key", "value");
                    }
                });
            }
        })));
    }
}
