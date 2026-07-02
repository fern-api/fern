package com.snippets;

import com.seed.object.SeedObjectClient;
import com.seed.object.requests.GetDiscriminatedUnionRequest;
import com.seed.object.types.ReferenceType;

public class Example1 {
    public static void main(String[] args) {
        SeedObjectClient client =
                SeedObjectClient.builder().url("https://api.fern.com").build();

        client.getDiscriminatedUnion(GetDiscriminatedUnionRequest.builder()
                .bar(GetDiscriminatedUnionRequest.Bar.type1(GetDiscriminatedUnionRequest.Bar.Type1.builder()
                        .foo("foo")
                        .bar(GetDiscriminatedUnionRequest.Bar.Type1.Bar_.builder()
                                .foo("foo")
                                .ref(ReferenceType.builder().foo("foo").build())
                                .build())
                        .ref(ReferenceType.builder().foo("foo").build())
                        .build()))
                .foo("foo")
                .build());
    }
}
