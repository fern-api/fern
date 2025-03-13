package com.snippets;

import com.seed.literal.SeedLiteralClient;
import com.seed.literal.resources.reference.types.ContainerObject;
import com.seed.literal.resources.reference.types.NestedObjectWithLiterals;
import com.seed.literal.resources.reference.types.SendRequest;
import java.util.ArrayList;
import java.util.Arrays;

public class Example8 {
    public static void run() {
        SeedLiteralClient client = SeedLiteralClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.reference().send(
            SendRequest
                .builder()
                .prompt("You are a helpful assistant")
                .stream(false)
                .context("You're super wise")
                .query("What is the weather today")
                .containerObject(
                    ContainerObject
                        .builder()
                        .nestedObjects(
                            new ArrayList<NestedObjectWithLiterals>(
                                Arrays.asList(
                                    NestedObjectWithLiterals
                                        .builder()
                                        .literal1("literal1")
                                        .literal2("literal2")
                                        .strProp("strProp")
                                        .build()
                                )
                            )
                        )
                        .build()
                )
                .build()
        );
    }
}