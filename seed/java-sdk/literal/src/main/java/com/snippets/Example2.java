package com.snippets;

import com.seed.literal.SeedLiteralClient;
import com.seed.literal.resources.inlined.requests.SendLiteralsInlinedRequest;
import com.seed.literal.resources.inlined.types.ANestedLiteral;
import com.seed.literal.resources.inlined.types.ATopLevelLiteral;

public class Example2 {
    public static void run() {
        SeedLiteralClient client = SeedLiteralClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.inlined().send(
            SendLiteralsInlinedRequest
                .builder()
                .temperature(10.1)
                .objectWithLiteral(
                    ATopLevelLiteral
                        .builder()
                        .nestedLiteral(
                            ANestedLiteral
                                .builder()
                                .build()
                        )
                        .build()
                )
                .query("What is the weather today")
                .build()
        );
    }
}