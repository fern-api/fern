package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.PlantPost;
import com.seed.api.types.PlantPostSunExposure;
import com.seed.api.types.PlantPostWateringFrequency;

public class Example11 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.createPlant(PlantPost.builder()
                .species("species")
                .family("family")
                .genus("genus")
                .commonName("commonName")
                .wateringFrequency(PlantPostWateringFrequency.DAILY)
                .sunExposure(PlantPostSunExposure.FULL)
                .plantedAt("2023-01-15")
                .soilType("soilType")
                .build());
    }
}
