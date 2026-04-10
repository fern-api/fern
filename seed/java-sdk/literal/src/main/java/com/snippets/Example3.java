package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.inlined.requests.InlinedSendRequest;
import com.seed.api.resources.inlined.types.InlinedSendRequestContext;
import com.seed.api.resources.inlined.types.InlinedSendRequestPrompt;
import com.seed.api.types.ANestedLiteral;
import com.seed.api.types.ANestedLiteralMyLiteral;
import com.seed.api.types.ATopLevelLiteral;
import com.seed.api.types.SomeAliasedLiteral;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.inlined()
                .send(
                        InlinedSendRequest.builder()
                                .prompt(InlinedSendRequestPrompt.YOU_ARE_A_HELPFUL_ASSISTANT)
                                .query("query")
                                .stream(true)
                                .aliasedContext(SomeAliasedLiteral.YOURE_SUPER_WISE)
                                .objectWithLiteral(ATopLevelLiteral.builder()
                                        .nestedLiteral(ANestedLiteral.builder()
                                                .myLiteral(ANestedLiteralMyLiteral.HOW_SUPER_COOL)
                                                .build())
                                        .build())
                                .context(InlinedSendRequestContext.YOURE_SUPER_WISE)
                                .temperature(1.1)
                                .maybeContext(SomeAliasedLiteral.YOURE_SUPER_WISE)
                                .build());
    }
}
