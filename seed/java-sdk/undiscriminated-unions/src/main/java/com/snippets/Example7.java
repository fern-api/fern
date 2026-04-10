package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.union.requests.Request;
import com.seed.api.types.MetadataUnion;
import java.util.HashMap;
import java.util.Optional;

public class Example7 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.union()
                .call(Request.builder()
                        .union(MetadataUnion.of(Optional.of(new HashMap<String, Object>() {
                            {
                                put("union", new HashMap<String, Object>() {
                                    {
                                        put("key", "value");
                                    }
                                });
                            }
                        })))
                        .build());
    }
}
