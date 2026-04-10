package com.snippets;

import com.seed.noRetries.SeedNoRetriesClient;

public class Example0 {
    public static void main(String[] args) {
        SeedNoRetriesClient client =
                SeedNoRetriesClient.builder().url("https://api.fern.com").build();

        client.retries().getUsers();
    }
}
