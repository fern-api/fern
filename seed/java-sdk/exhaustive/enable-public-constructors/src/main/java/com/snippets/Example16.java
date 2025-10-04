package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.resources.types.object.types.ObjectWithRequiredField;

public class Example16 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .object()
                .getAndReturnWithRequiredField(
                        ObjectWithRequiredField.builder().string("string").build());
    }
}
