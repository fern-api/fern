package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.users.requests.UsersListWithTopLevelBodyCursorPaginationRequest;

public class Example33 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.users()
                .listwithtoplevelbodycursorpagination(UsersListWithTopLevelBodyCursorPaginationRequest.builder()
                        .cursor("cursor")
                        .filter("filter")
                        .build());
    }
}
