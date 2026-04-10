package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.singleproperty.requests.SinglePropertyDoThingRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.singleproperty()
                .dothing(
                        "id",
                        SinglePropertyDoThingRequest.builder()
                                .includeRemoteData(true)
                                .build());
    }
}
