package com.snippets;

import com.seed.exhaustive.SeedExhaustiveClient;
import com.seed.exhaustive.resources.types.object.types.ObjectWithRequiredField;
import java.util.Arrays;
import java.util.HashSet;

public class Example3 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.endpoints()
                .container()
                .getAndReturnSetOfObjects(new HashSet<ObjectWithRequiredField>(Arrays.asList(
                        ObjectWithRequiredField.builder().string("string").build())));
    }
}
