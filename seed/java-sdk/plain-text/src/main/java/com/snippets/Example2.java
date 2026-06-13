package com.snippets;

import com.seed.plainText.SeedPlainTextClient;

public class Example2 {
    public static void main(String[] args) {
        SeedPlainTextClient client =
                SeedPlainTextClient.builder().url("https://api.fern.com").build();

        client.service().getXml();
    }
}
