package com.snippets;

import com.seed.singleProperty.SeedSinglePropertyClient;
import com.seed.singleProperty.resources.singleproperty.requests.GetThingRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedSinglePropertyClient client = SeedSinglePropertyClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.singleProperty().doThing(
            "id",
            GetThingRequest
                .builder()
                .includeRemoteData(true)
                .build()
        );
    }
}