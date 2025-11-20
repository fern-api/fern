package com.snippets;

import com.seed.bytesDownload.SeedBytesDownloadClient;

public class Example0 {
    public static void main(String[] args) {
        SeedBytesDownloadClient client =
                SeedBytesDownloadClient.builder().url("https://api.fern.com").build();

        client.service().simple();
    }
}
