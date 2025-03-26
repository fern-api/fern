package com.snippets;

import com.seed.literal.SeedLiteralClient;
import com.seed.literal.resources.query.requests.SendLiteralsInQueryRequest;

public class Example6 {
    public static void main(String[] args) {
        SeedLiteralClient client = SeedLiteralClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.query().send(
            SendLiteralsInQueryRequest
                .builder()
                .prompt("You are a helpful assistant")
                .aliasPrompt("You are a helpful assistant")
                .stream(false)
                .aliasStream(false)
                .query("What is the weather today")
                .optionalPrompt("You are a helpful assistant")
                .aliasOptionalPrompt("You are a helpful assistant")
                .optionalStream(false)
                .aliasOptionalStream(false)
                .build()
        );
    }
}