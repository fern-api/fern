package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.UpdatePlantRequest;
import java.util.HashMap;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.updatePlant(
                "plantId",
                UpdatePlantRequest.builder()
                        .body(new HashMap<String, Object>() {
                            {
                                put("key", "value");
                            }
                        })
                        .build());
    }
}
