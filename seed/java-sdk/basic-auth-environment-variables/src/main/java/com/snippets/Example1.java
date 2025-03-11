package com.snippets;

import com.seed.basic.auth.environment.variables.SeedBasicAuthEnvironmentVariablesClient;
import java.util.HashMap;

public class Example1 {
    public static void run() {
        SeedBasicAuthEnvironmentVariablesClient client = SeedBasicAuthEnvironmentVariablesClient
            .builder()
            .username("<username>")
            .accessToken("<password>")
            .url("https://api.fern.com")
            .build();

        client.basicAuth().postWithBasicAuth(new 
        HashMap<String, Object>() {{put("key", "value");
        }});
    }
}