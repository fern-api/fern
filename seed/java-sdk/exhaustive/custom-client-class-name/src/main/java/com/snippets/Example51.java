package com.snippets;

import com.seed.exhaustive.Best;

public class Example51 {
    public static void main(String[] args) {
        Best client = Best.withCredentials("<clientId>", "<clientSecret>")
                .url("https://api.fern.com")
                .build();

        client.noReqBody().postWithNoRequestBody();
    }
}
