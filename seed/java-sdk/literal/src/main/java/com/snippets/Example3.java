package com.snippets;

import com.seed.literal.SeedLiteralClient;
import com.seed.literal.resources.inlined.requests.SendLiteralsInlinedRequest;
import com.seed.literal.resources.inlined.types.ANestedLiteral;
import com.seed.literal.resources.inlined.types.ATopLevelLiteral;

public class Example3 {
    public static void run() {
        SeedLiteralClient client = SeedLiteralClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.inlined().send(
            SendLiteralsInlinedRequest
                .builder()
                .prompt("You are a helpful assistant")
                .query("query")
                .stream(false)
                .aliasedContext("You're super wise")
                .objectWithLiteral(
                    ATopLevelLiteral
                        .builder()
                        .nestedLiteral(
                            ANestedLiteral
                                .builder()
                                .myLiteral("How super cool")
                                .build()
                        )
                        .build()
                )
                .context("You're super wise")
                .temperature(1.1)
                .maybeContext("You're super wise")
                .build()
        );
    }
}