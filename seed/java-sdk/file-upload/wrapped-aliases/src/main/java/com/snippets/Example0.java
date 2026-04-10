package com.snippets;

import com.seed.fileUpload.SeedFileUploadClient;
import com.seed.fileUpload.resources.service.requests.JustFileRequest;

public class Example0 {
    public static void main(String[] args) {
        SeedFileUploadClient client =
                SeedFileUploadClient.builder().url("https://api.fern.com").build();

        client.service().justFile(JustFileRequest.builder().build());
    }
}
