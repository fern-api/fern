package com.snippets;

import com.seed.api.SeedApiClient;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.createPlant(new HashMap<String, Object>() {
            {
                put("name", "Venus Flytrap");
                put("species", "Dionaea muscipula");
                put("care", new HashMap<String, Object>() {
                    {
                        put("light", "full sun");
                        put("water", "distilled only");
                        put("humidity", "high");
                    }
                });
                put("tags", new ArrayList<Object>(Arrays.asList("carnivorous", "tropical")));
            }
        });
    }
}
