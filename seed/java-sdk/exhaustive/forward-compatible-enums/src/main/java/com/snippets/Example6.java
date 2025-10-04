package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.resources.types.object.types.ObjectWithRequiredField;
import java.util.Optional;

public class Example6 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .container()
                .getAndReturnOptional(Optional.of(
                        ObjectWithRequiredField.builder().string("string").build()));
    }
}
