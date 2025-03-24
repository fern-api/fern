package com.snippets;

import com.seed.examples.SeedExamplesClient;
import com.seed.examples.resources.file.service.requests.GetFileRequest;

public class Example6 {
    public static void main(String[] args) {
        SeedExamplesClient client = SeedExamplesClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.file().service().getFile(
            "filename",
            GetFileRequest
                .builder()
                .xFileApiVersion("X-File-API-Version")
                .build()
        );
    }
}