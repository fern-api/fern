package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.CreatePlantWithSchemaRequest;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.createPlantWithSchema(CreatePlantWithSchemaRequest.builder()
                .name("name")
                .species("species")
                .build());
    }
}
