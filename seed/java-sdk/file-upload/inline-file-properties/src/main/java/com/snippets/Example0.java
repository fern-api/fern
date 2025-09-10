package com.snippets;

import com.seed.fileUpload.SeedFileUploadClient;

public class Example0 {
    public static void main(String[] args) {
        SeedFileUploadClient client = SeedFileUploadClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().simple();
    }
}