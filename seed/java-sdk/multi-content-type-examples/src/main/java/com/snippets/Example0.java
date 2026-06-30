package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.clients.requests.ClientRequest;
import com.seed.api.types.Client;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.clients()
                .create(ClientRequest.builder()
                        .client(Client.builder()
                                .name("Acme Corp")
                                .email("contact@acme.com")
                                .build())
                        .build());
    }
}
