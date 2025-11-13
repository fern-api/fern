package com.snippets;

import com.seed.literal.SeedLiteralClient;
import com.seed.literal.resources.reference.types.ContainerObject;
import com.seed.literal.resources.reference.types.NestedObjectWithLiterals;
import com.seed.literal.resources.reference.types.SendRequest;
import java.util.Arrays;

public class Example8 {
    public static void main(String[] args) {
        SeedLiteralClient client =
                SeedLiteralClient.builder().url("https://api.fern.com").build();

        client.reference()
                .send(SendRequest.builder()
                        .context("You're super wise")
                        .query("What is the weather today")
                        .containerObject(ContainerObject.builder()
                                .nestedObjects(Arrays.asList(NestedObjectWithLiterals.builder()
                                        .strProp("strProp")
                                        .build()))
                                .build())
                        .build());
    }
}
