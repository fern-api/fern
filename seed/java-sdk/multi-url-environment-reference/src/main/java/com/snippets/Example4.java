package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.files.requests.FilesUploadRequest;

public class Example4 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder().token("<token>").build();

        client.files()
                .upload(FilesUploadRequest.builder()
                        .name("name")
                        .parentId("parent_id")
                        .build());
    }
}
