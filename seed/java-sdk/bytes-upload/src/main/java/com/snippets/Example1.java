package com.snippets;

import com.seed.bytesUpload.SeedBytesUploadClient;
import com.seed.bytesUpload.resources.service.requests.UploadWithQueryParamsRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedBytesUploadClient client =
                SeedBytesUploadClient.builder().url("https://api.fern.com").build();

        client.service()
                .uploadWithQueryParams(UploadWithQueryParamsRequest.builder()
                        .model("nova-2")
                        .body("".getBytes())
                        .build());
    }
}
