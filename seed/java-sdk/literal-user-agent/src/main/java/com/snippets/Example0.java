package com.snippets;

import com.seed.literalUserAgent.SeedLiteralUserAgentClient;

public class Example0 {
    public static void main(String[] args) {
        SeedLiteralUserAgentClient client =
                SeedLiteralUserAgentClient.builder().url("https://api.fern.com").build();

        client.ping();
    }
}
