package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.usereventsmetadata.requests.UserEventsMetadataGetMetadataRequest;

public class Example7 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.userEventsMetadata()
                .userEventsMetadataGetMetadata(
                        UserEventsMetadataGetMetadataRequest.builder().id("id").build());
    }
}
