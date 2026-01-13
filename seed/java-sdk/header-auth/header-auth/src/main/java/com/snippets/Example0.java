package com.snippets;

import com.seed.headerToken.SeedHeaderTokenClient;

public class Example0 {
    public static void main(String[] args) {
        SeedHeaderTokenClient client = SeedHeaderTokenClient.builder()
                .headerTokenAuth("<value>")
                .url("https://api.fern.com")
                .build();

        client.service().getWithBearerToken();
    }
}
