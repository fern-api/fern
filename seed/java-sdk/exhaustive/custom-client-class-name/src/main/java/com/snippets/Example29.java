package com.snippets;

import com.seed.exhaustive.Best;

public class Example29 {
    public static void main(String[] args) {
        Best client = Best.withCredentials("<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().params().modifyWithPath("param", "string");
    }
}
