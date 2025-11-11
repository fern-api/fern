package com.snippets;

import com.seed.fileUpload.SeedFileUploadClient;
import com.seed.fileUpload.resources.service.requests.OptionalArgsRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedFileUploadClient client =
                SeedFileUploadClient.builder().url("https://api.fern.com").build();

        client.service().optionalArgs(OptionalArgsRequest.builder().build());
    }
}
