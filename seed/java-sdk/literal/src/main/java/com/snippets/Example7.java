package com.snippets;

import com.seed.literal.SeedLiteralClient;
import com.seed.literal.resources.query.requests.SendLiteralsInQueryRequest;

public class Example7 {
    public static void run() {
        SeedLiteralClient client = SeedLiteralClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.query().send(
            SendLiteralsInQueryRequest
                .builder()
                .prompt("You are a helpful assistant")
                .aliasPrompt("You are a helpful assistant")
                .query("query")
                .stream(false)
                .aliasStream(false)
                .optionalPrompt("You are a helpful assistant")
                .aliasOptionalPrompt("You are a helpful assistant")
                .optionalStream(false)
                .aliasOptionalStream(false)
                .build()
        );
    }
}