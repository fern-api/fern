package com.snippets;

import com.seed.api.BaseClient;

public class Example1 {
    public static void main(String[] args) {
        BaseClient client = BaseClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service().hello();
    }
}
