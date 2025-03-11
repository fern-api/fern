package com.snippets;

import com.seed.single.property.SeedSinglePropertyClient;
import com.seed.single.property.resources.singleproperty.requests.GetThingRequest;

public class Example0 {
    public static void run() {
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