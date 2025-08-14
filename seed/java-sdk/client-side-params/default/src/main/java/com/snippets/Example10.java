package com.snippets;

import com.seed.clientSideParams.SeedClientSideParamsClient;
import com.seed.clientSideParams.resources.service.requests.ListClientsRequest;
import java.util.ArrayList;
import java.util.Arrays;

public class Example10 {
    public static void main(String[] args) {
        SeedClientSideParamsClient client = SeedClientSideParamsClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().listClients(
            ListClientsRequest
                .builder()
                .fields("fields")
                .includeFields(true)
                .page(1)
                .perPage(1)
                .includeTotals(true)
                .isGlobal(true)
                .isFirstParty(true)
                .appType(
                    new ArrayList<String>(
                        Arrays.asList("app_type", "app_type")
                    )
                )
                .build()
        );
    }
}