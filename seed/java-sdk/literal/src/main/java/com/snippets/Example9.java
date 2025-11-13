package com.snippets;

import com.seed.literal.SeedLiteralClient;
import com.seed.literal.resources.reference.types.ContainerObject;
import com.seed.literal.resources.reference.types.NestedObjectWithLiterals;
import com.seed.literal.resources.reference.types.SendRequest;
import java.util.Arrays;

public class Example9 {
    public static void main(String[] args) {
        SeedLiteralClient client =
                SeedLiteralClient.builder().url("https://api.fern.com").build();

        client.reference()
                .send(SendRequest.builder()
                        .query("query")
                        .context("You're super wise")
                        .containerObject(ContainerObject.builder()
                                .nestedObjects(Arrays.asList(
                                        NestedObjectWithLiterals.builder()
                                                .strProp("strProp")
                                                .build(),
                                        NestedObjectWithLiterals.builder()
                                                .strProp("strProp")
                                                .build()))
                                .build())
                        .maybeContext("You're super wise")
                        .build());
    }
}
