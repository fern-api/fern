package com.snippets;

import com.seed.api.Best;
import com.seed.api.types.TypesObjectWithMapOfMap;
import java.util.HashMap;
import java.util.Map;

public class Example37 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsObject()
                .endpointsObjectGetAndReturnWithMapOfMap(TypesObjectWithMapOfMap.builder()
                        .map(new HashMap<String, Map<String, String>>() {
                            {
                                put("map", new HashMap<String, String>() {
                                    {
                                        put("map", "map");
                                    }
                                });
                            }
                        })
                        .build());
    }
}
