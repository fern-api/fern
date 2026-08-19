package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.UpdatePlantRequest;
import java.util.HashMap;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.updatePlant(
                "plantId",
                UpdatePlantRequest.builder()
                        .body(new HashMap<String, Object>() {
                            {
                                put("name", "Updated Venus Flytrap");
                                put("care", new HashMap<String, Object>() {
                                    {
                                        put("light", "partial shade");
                                    }
                                });
                            }
                        })
                        .build());
    }
}
