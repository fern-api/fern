package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.s3.requests.S3GetPresignedUrlRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.s3()
                .getpresignedurl(
                        S3GetPresignedUrlRequest.builder().s3Key("s3Key").build());
    }
}
