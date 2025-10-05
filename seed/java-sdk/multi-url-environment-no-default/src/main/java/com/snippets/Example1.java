package com.snippets;

import com.seed.multiUrlEnvironmentNoDefault.SeedMultiUrlEnvironmentNoDefaultClient;
import com.seed.multiUrlEnvironmentNoDefault.resources.s3.requests.GetPresignedUrlRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedMultiUrlEnvironmentNoDefaultClient client = SeedMultiUrlEnvironmentNoDefaultClient.builder()
                .token("<token>")
                .build();

        client.s3()
                .getPresignedUrl(GetPresignedUrlRequest.builder().s3Key("s3Key").build());
    }
}
