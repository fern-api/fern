package com.snippets;

import com.seed.errors.SeedErrorsClient;
import com.seed.errors.resources.simple.types.FooRequest;

public class Example3 {
    public static void main(String[] args) {
        SeedErrorsClient client =
                SeedErrorsClient.builder().url("https://api.fern.com").build();

        client.simple().fooWithoutEndpointError(FooRequest.builder().bar("bar").build());
    }
}
