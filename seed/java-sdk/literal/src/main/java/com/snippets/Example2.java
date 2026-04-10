package com.snippets;

import com.seed.literal.SeedLiteralClient;
import com.seed.literal.resources.inlined.requests.SendLiteralsInlinedRequest;
import com.seed.literal.resources.inlined.types.ANestedLiteral;
import com.seed.literal.resources.inlined.types.ATopLevelLiteral;

public class Example2 {
    public static void main(String[] args) {
        SeedLiteralClient client =
                SeedLiteralClient.builder().url("https://api.fern.com").build();

        client.inlined()
                .send(SendLiteralsInlinedRequest.builder()
                        .query("What is the weather today")
                        .aliasedContext("You're super wise")
                        .objectWithLiteral(ATopLevelLiteral.builder()
                                .nestedLiteral(ANestedLiteral.builder().build())
                                .build())
                        .context("You're super wise")
                        .temperature(10.1)
                        .maybeContext("You're super wise")
                        .build());
    }
}
