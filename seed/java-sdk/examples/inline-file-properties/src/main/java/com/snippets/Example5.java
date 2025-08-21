package com.snippets;

import com.seed.examples.SeedExamplesClient;
import com.seed.examples.resources.file.service.requests.GetFileRequest;

public class Example5 {
    public static void main(String[] args) {
        SeedExamplesClient client = SeedExamplesClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.file().service().getFile(
            "file.txt",
            GetFileRequest
                .builder()
                .xFileApiVersion("0.0.2")
                .build()
        );
    }
}