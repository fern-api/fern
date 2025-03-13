package com.snippets;

import com.seed.exhaustive.Best;
import java.util.HashMap;

public class Example4 {
    public static void run() {
        Best client = Best
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().container().getAndReturnMapPrimToPrim(
            new HashMap<String, String>() {{
                put("string", "string");
            }}
        );
    }
}