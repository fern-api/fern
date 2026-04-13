package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.fileservice.requests.FileServiceGetFileRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.fileService()
                .fileServiceGetFile(
                        FileServiceGetFileRequest.builder().filename("filename").build());
    }
}
