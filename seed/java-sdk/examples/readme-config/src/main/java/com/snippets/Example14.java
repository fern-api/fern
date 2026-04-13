package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceGetMetadataRequest;
import java.util.Arrays;
import java.util.Optional;

public class Example14 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .getmetadata(ServiceGetMetadataRequest.builder()
                        .apiVersion("apiVersion")
                        .tag(Arrays.asList(Optional.of("tag")))
                        .shallow(true)
                        .build());
    }
}
