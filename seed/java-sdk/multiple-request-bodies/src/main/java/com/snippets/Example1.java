package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.UploadDocumentRequest;
import java.util.ArrayList;
import java.util.Arrays;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.uploadJsonDocument(
            UploadDocumentRequest
                .builder()
                .author("author")
                .tags(
                    new ArrayList<String>(
                        Arrays.asList("tags", "tags")
                    )
                )
                .title("title")
                .build()
        );
    }
}