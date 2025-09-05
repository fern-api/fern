package com.snippets;

import com.seed.api.SeedApiClient;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .build();

        client.getWallet("walletId");
    }
}