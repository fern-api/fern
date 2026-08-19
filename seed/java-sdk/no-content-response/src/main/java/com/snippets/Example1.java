package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.contacts.requests.CreateContactRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.contacts()
                .create(CreateContactRequest.builder()
                        .name("name")
                        .email("email")
                        .build());
    }
}
