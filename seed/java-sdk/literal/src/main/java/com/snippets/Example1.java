package com.snippets;

import com.seed.literal.SeedLiteralClient;
import com.seed.literal.resources.headers.requests.SendLiteralsInHeadersRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedLiteralClient client =
                SeedLiteralClient.builder().url("https://api.fern.com").build();

        client.headers()
                .send(SendLiteralsInHeadersRequest.builder().query("query").build());
    }
}
