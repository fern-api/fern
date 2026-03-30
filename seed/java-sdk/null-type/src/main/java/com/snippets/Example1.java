package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.conversations.requests.OutboundCallConversationsRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.conversations().outboundCall(
            OutboundCallConversationsRequest
                .builder()
                .toPhoneNumber("to_phone_number")
                .dryRun(true)
                .build()
        );
    }
}