package com.snippets;

import com.seed.object.SeedObjectClient;
import com.seed.object.requests.PostRootRequest;
import com.seed.object.types.RequestTypeInlineType1;

public class Example0 {
    public static void main(String[] args) {
        SeedObjectClient client =
                SeedObjectClient.builder().url("https://api.fern.com").build();

        client.getRoot(PostRootRequest.builder()
                .bar(RequestTypeInlineType1.builder().foo("foo").build())
                .foo("foo")
                .build());
    }
}
