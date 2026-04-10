package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.FooRequest;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.simple().foo(FooRequest.builder().bar("bar").build());
    }
}
