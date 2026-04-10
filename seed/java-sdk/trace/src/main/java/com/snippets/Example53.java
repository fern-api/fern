package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.sysprop.requests.SyspropSetNumWarmInstancesRequest;
import com.seed.api.types.Language;

public class Example53 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.sysprop()
                .setnumwarminstances(
                        Language.JAVA,
                        1,
                        SyspropSetNumWarmInstancesRequest.builder().build());
    }
}
