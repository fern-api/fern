package com.snippets;

import com.seed.javaStreamingAcceptHeader.SeedJavaStreamingAcceptHeaderClient;
import com.seed.javaStreamingAcceptHeader.resources.dummy.requests.GenerateRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedJavaStreamingAcceptHeaderClient client = SeedJavaStreamingAcceptHeaderClient.builder()
                .url("https://api.fern.com")
                .build();

        client.dummy().generate(GenerateRequest.builder().numEvents(5).build());
    }
}
