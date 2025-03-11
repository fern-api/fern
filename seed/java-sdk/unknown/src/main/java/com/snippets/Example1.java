package com.snippets;

import com.seed.unknown.as.any.SeedUnknownAsAnyClient;
import com.seed.unknown.as.any.resources.unknown.types.MyObject;
import java.util.HashMap;

public class Example1 {
    public static void run() {
        SeedUnknownAsAnyClient client = SeedUnknownAsAnyClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.unknown().postObject(
            MyObject
                .builder()
                .unknown(new 
                    HashMap<String, Object>() {{put("key", "value");
                    }})
                .build()
        );
    }
}