package com.snippets;

import com.seed.multi.url.environment.SeedMultiUrlEnvironmentClient;
import com.seed.multi.url.environment.resources.s3.requests.GetPresignedUrlRequest;

public class Example1 {
    public static void run() {
        SeedMultiUrlEnvironmentClient client = SeedMultiUrlEnvironmentClient
            .builder()
            .token("<token>")
            .build();

        client.s3().getPresignedUrl(
            GetPresignedUrlRequest
                .builder()
                .s3Key("s3Key")
                .build()
        );
    }
}