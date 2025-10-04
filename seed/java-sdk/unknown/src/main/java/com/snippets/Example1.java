package com.snippets;

import com.seed.unknownAsAny.SeedUnknownAsAnyClient;
import com.seed.unknownAsAny.resources.unknown.types.MyObject;
import java.util.HashMap;

public class Example1 {
    public static void main(String[] args) {
        SeedUnknownAsAnyClient client =
                SeedUnknownAsAnyClient.builder().url("https://api.fern.com").build();

        client.unknown()
                .postObject(MyObject.builder()
                        .unknown(new HashMap<String, Object>() {
                            {
                                put("key", "value");
                            }
                        })
                        .build());
    }
}
