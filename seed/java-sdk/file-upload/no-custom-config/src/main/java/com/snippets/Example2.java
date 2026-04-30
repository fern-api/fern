package com.snippets;

import com.seed.fileUpload.SeedFileUploadClient;
import com.seed.fileUpload.resources.service.requests.WithRefBodyRequest;
import com.seed.fileUpload.resources.service.types.MyObject;

public class Example2 {
    public static void main(String[] args) {
        SeedFileUploadClient client =
                SeedFileUploadClient.builder().url("https://api.fern.com").build();

        client.service()
                .withRefBody(
                        null,
                        WithRefBodyRequest.builder()
                                .request(MyObject.builder().foo("bar").build())
                                .build());
    }
}
