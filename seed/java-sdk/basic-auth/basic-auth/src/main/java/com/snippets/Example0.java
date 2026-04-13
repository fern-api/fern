package com.snippets;

import com.seed.api.SeedApiClient;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .credentials("<username>", "<password>")
                .url("https://api.fern.com")
                .build();

        client.basicauth().getwithbasicauth();
    }
}
