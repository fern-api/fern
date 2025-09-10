package com.snippets;

import com.seed.builderExtension.BaseClient;

public class Example0 {
    public static void main(String[] args) {
        BaseClient client = BaseClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.service().hello();
    }
}