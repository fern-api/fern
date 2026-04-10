package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.foo.requests.FooFindRequest;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.foo()
                .find(FooFindRequest.builder()
                        .optionalString("optionalString")
                        .publicProperty("publicProperty")
                        .privateProperty(1)
                        .build());
    }
}
