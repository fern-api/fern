package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.types.object.types.ObjectWithMapOfMap;
import java.util.HashMap;
import java.util.Map;

public class Example17 {
    public static void run() {
        Best client = Best
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().getAndReturnWithMapOfMap(
            ObjectWithMapOfMap
                .builder()
                .map(
                    new HashMap<String, Map<String, String>>() {{
                        put("map", new HashMap<String, String>() {{
                            put("map", "map");
                        }});
                    }}
                )
                .build()
        );
    }
}