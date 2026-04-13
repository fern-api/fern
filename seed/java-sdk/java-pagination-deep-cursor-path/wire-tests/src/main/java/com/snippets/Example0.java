package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.deepcursorpath.requests.A;

public class Example0 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.deepcursorpath().doThing(A.builder().build());
    }
}
