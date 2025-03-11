package com.snippets;

import com.seed.literal.SeedLiteralClient;
import com.seed.literal.resources.reference.types.ContainerObject;
import com.seed.literal.resources.reference.types.NestedObjectWithLiterals;
import com.seed.literal.resources.reference.types.SendRequest;
import java.util.ArrayList;
import java.util.Arrays;

public class Example9 {
    public static void run() {
        SeedLiteralClient client = SeedLiteralClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.reference().send(
            SendRequest
                .builder()
                .query("query")
                .containerObject(
                    ContainerObject
                        .builder()
                        .nestedObjects(
                            new ArrayList<NestedObjectWithLiterals>(
                                Arrays.asList(
                                    NestedObjectWithLiterals
                                        .builder()
                                        .strProp("strProp")
                                        .build(),
                                    NestedObjectWithLiterals
                                        .builder()
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