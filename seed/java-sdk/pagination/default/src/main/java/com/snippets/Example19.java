package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.inlineusersinlineusers.requests.InlineUsersInlineUsersListWithExtendedResultsRequest;

public class Example19 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.inlineUsersInlineUsers()
                .inlineUsersInlineUsersListWithExtendedResults(
                        InlineUsersInlineUsersListWithExtendedResultsRequest.builder()
                                .cursor("cursor")
                                .build());
    }
}
