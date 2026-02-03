package com.snippets;

import com.seed.exhaustive.Best;

public class Example34 {
    public static void main(String[] args) {
        Best client = Best.withCredentials("<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.endpoints().primitive().getAndReturnDouble(1.1);
    }
}
