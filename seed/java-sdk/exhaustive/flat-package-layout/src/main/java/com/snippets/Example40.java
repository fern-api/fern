package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import java.util.HashMap;

public class Example40 {
    public static void run() {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.noAuth().postWithNoAuth(new 
        HashMap<String, Object>() {{put("key", "value");
        }});
    }
}