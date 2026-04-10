package com.snippets;

import com.seed.javaStreamingAcceptHeader.SeedJavaStreamingAcceptHeaderClient;
import com.seed.javaStreamingAcceptHeader.resources.dummy.requests.GenerateStreamRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedJavaStreamingAcceptHeaderClient client = SeedJavaStreamingAcceptHeaderClient.builder()
                .url("https://api.fern.com")
                .build();

        client.dummy()
                .generateStream(GenerateStreamRequest.builder().numEvents(1).build());
    }
}
