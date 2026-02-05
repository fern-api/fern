package com.snippets;

import com.seed.literal.SeedLiteralClient;
import com.seed.literal.resources.inlined.requests.SendLiteralsInlinedRequest;
import com.seed.literal.resources.inlined.types.ANestedLiteral;
import com.seed.literal.resources.inlined.types.ATopLevelLiteral;

public class Example3 {
    public static void main(String[] args) {
        SeedLiteralClient client =
                SeedLiteralClient.builder().url("https://api.fern.com").build();

        client.inlined()
                .send(SendLiteralsInlinedRequest.builder()
                        .query("query")
                        .aliasedContext("You're super wise")
                        .objectWithLiteral(ATopLevelLiteral.builder()
                                .nestedLiteral(ANestedLiteral.builder().build())
                                .build())
                        .context("You're super wise")
                        .temperature(1.1)
                        .maybeContext("You're super wise")
                        .build());
    }
}
