package com.snippets;

import com.seed.exhaustive.Best;

public class Example24 {
    public static void main(String[] args) {
        Best client = Best.withCredentials("<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().params().getWithPath("param");
    }
}
