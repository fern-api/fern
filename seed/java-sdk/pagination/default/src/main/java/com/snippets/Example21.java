package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest;

public class Example21 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithExtendedResultsAndOptionalData(
                        InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest.builder()
                                .cursor("cursor")
                                .build());
    }
}
