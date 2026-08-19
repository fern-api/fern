package com.snippets;

import com.seed.bytesUpload.SeedBytesUploadClient;

public class Example0 {
    public static void main(String[] args) {
        SeedBytesUploadClient client =
                SeedBytesUploadClient.builder().url("https://api.fern.com").build();

        client.service().upload("".getBytes());
    }
}
