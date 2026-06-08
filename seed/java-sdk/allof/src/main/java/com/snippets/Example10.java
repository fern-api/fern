package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.PlantPost;
import com.seed.api.types.PlantPostSunExposure;

public class Example10 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.createPlant(PlantPost.builder()
                .species("species")
                .family("family")
                .genus("genus")
                .sunExposure(PlantPostSunExposure.FULL)
                .build());
    }
}
