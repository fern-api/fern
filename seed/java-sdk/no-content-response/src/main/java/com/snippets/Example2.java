package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.contacts.requests.GetContactsRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.contacts().get("id", GetContactsRequest.builder().build());
    }
}
