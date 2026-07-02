package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.resources.endpoints.params.requests.CreateWithBodyAndQuery;
import com.seed.exhaustive.resources.types.object.types.ObjectWithRequiredField;

public class Example42 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .params()
                .createWithBodyAndQuery(CreateWithBodyAndQuery.builder()
                        .body(ObjectWithRequiredField.builder().string("string").build())
                        .fields("_fields")
                        .build());
    }
}
