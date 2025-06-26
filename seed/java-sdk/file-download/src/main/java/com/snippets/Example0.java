package com.snippets;

import com.seed.fileDownload.SeedFileDownloadClient;

public class Example0 {
    public static void main(String[] args) {
        SeedFileDownloadClient client = SeedFileDownloadClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().simple();
    }
}