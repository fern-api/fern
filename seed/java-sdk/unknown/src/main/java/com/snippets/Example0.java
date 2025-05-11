package com.snippets;

import com.seed.unknownAsAny.SeedUnknownAsAnyClient;
import java.util.HashMap;

public class Example0 {
    public static void main(String[] args) {
        SeedUnknownAsAnyClient client = SeedUnknownAsAnyClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.unknown().post(new 
        HashMap<String, Object>() {{put("key", "value");
        }});
    }
}