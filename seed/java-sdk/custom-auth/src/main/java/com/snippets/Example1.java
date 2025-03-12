package com.snippets;

import com.seed.customAuth.SeedCustomAuthClient;
import java.util.HashMap;

public class Example1 {
    public static void run() {
        SeedCustomAuthClient client = SeedCustomAuthClient
            .builder()
            .customAuthScheme("<value>")
            .url("https://api.fern.com")
            .build();

        client.customAuth().postWithCustomAuth(new 
        HashMap<String, Object>() {{put("key", "value");
        }});
    }
}