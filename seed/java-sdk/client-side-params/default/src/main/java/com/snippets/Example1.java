package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceListResourcesRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .listresources(ServiceListResourcesRequest.builder()
                        .page(1)
                        .perPage(1)
                        .sort("sort")
                        .order("order")
                        .includeTotals(true)
                        .fields("fields")
                        .search("search")
                        .build());
    }
}
