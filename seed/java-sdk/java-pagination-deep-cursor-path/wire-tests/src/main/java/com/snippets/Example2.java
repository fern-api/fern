package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.deepcursorpath.requests.MainRequired;
import com.seed.api.types.IndirectionRequired;
import java.util.Arrays;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.deepcursorpath()
                .doThingRequired(MainRequired.builder()
                        .indirection(IndirectionRequired.builder()
                                .results(Arrays.asList("results"))
                                .build())
                        .build());
    }
}
