package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceListUsersRequest;

public class Example7 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .listusers(ServiceListUsersRequest.builder()
                        .page(1)
                        .perPage(1)
                        .includeTotals(true)
                        .sort("sort")
                        .connection("connection")
                        .q("q")
                        .searchEngine("search_engine")
                        .fields("fields")
                        .build());
    }
}
