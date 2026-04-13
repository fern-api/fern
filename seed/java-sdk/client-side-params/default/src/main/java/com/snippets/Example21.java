package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceListClientsRequest;
import java.util.Arrays;
import java.util.Optional;

public class Example21 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .listclients(ServiceListClientsRequest.builder()
                        .fields("fields")
                        .includeFields(true)
                        .page(1)
                        .perPage(1)
                        .includeTotals(true)
                        .isGlobal(true)
                        .isFirstParty(true)
                        .appType(Optional.of(Arrays.asList("app_type", "app_type")))
                        .build());
    }
}
