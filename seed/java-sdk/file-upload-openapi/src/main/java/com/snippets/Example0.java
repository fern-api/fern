package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.fileuploadexample.requests.UploadFileRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.fileUploadExample()
                .uploadFile(UploadFileRequest.builder().name("name").build());
    }
}
