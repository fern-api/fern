package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesObjectWithMapOfMap;
import java.util.HashMap;
import java.util.Map;

public class Example48 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().getAndReturnWithMapOfMap(
            TypesObjectWithMapOfMap
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