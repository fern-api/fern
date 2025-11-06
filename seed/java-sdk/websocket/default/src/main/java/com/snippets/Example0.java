package com.snippets;

import com.seed.websocket.SeedWebsocketClient;

public class Example0 {
    public static void main(String[] args) {
        SeedWebsocketClient client =
                SeedWebsocketClient.builder().url("https://api.fern.com").build();

        client.realtime().health();
    }
}
