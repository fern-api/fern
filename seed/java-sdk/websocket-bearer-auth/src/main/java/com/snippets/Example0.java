package com.snippets;

import com.seed.websocketBearerAuth.SeedWebsocketBearerAuthClient;

public class Example0 {
    public static void main(String[] args) {
        SeedWebsocketBearerAuthClient client = SeedWebsocketBearerAuthClient.builder()
                .apiKey("<token>")
                .url("https://api.fern.com")
                .build();

        client.realtime().health();
    }
}
