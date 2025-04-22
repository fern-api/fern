package com.snippets;

import com.seed.literal.SeedLiteralClient;
import com.seed.literal.resources.reference.types.ContainerObject;
import com.seed.literal.resources.reference.types.NestedObjectWithLiterals;
import com.seed.literal.resources.reference.types.SendRequest;
import java.util.ArrayList;
import java.util.Arrays;

public class Example9 {
    public static void main(String[] args) {
        SeedLiteralClient client =
                SeedLiteralClient.builder().url("https://api.fern.com").build();

        client.reference()
                .send(SendRequest.builder().prompt("You are a helpful assistant").query("query").stream(false)
                        .ending("$ending")
                        .context("You're super wise")
                        .containerObject(ContainerObject.builder()
                                .nestedObjects(new ArrayList<NestedObjectWithLiterals>(Arrays.asList(
                                        NestedObjectWithLiterals.builder()
                                                .literal1("literal1")
                                                .literal2("literal2")
                                                .strProp("strProp")
                                                .build(),
                                        NestedObjectWithLiterals.builder()
                                                .literal1("literal1")
                                                .literal2("literal2")
                                                .strProp("strProp")
                                                .build())))
                                .build())
                        .maybeContext("You're super wise")
                        .build());
    }
}
