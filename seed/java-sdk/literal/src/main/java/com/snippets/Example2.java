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
                        .prompt("You are a helpful assistant")
                        .aliasedContext("You're super wise")
                        .objectWithLiteral(ATopLevelLiteral.builder()
                                .nestedLiteral(ANestedLiteral.builder()
                                        .myLiteral("How super cool")
                                        .build())
                                .build())
                        .stream(false)
                        .query("What is the weather today")
                        .temperature(10.1)
                        .context("You're super wise")
                        .maybeContext("You're super wise")
                        .build());
    }
}
