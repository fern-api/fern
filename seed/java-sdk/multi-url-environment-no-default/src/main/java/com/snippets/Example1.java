package com.snippets;

import com.seed.multi.url.environment.no.default.SeedMultiUrlEnvironmentNoDefaultClient;
import com.seed.multi.url.environment.no.default.resources.s3.requests.GetPresignedUrlRequest;

public class Example1 {
    public static void run() {
        SeedMultiUrlEnvironmentNoDefaultClient client = SeedMultiUrlEnvironmentNoDefaultClient
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