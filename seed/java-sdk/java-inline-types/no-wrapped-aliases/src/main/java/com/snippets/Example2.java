package com.snippets;

import com.seed.object.SeedObjectClient;
import com.seed.object.requests.GetUndiscriminatedUnionRequest;
import com.seed.object.types.ReferenceType;

public class Example2 {
    public static void main(String[] args) {
        SeedObjectClient client =
                SeedObjectClient.builder().url("https://api.fern.com").build();

        client.getUndiscriminatedUnion(GetUndiscriminatedUnionRequest.builder()
                .bar(GetUndiscriminatedUnionRequest.Bar.of(GetUndiscriminatedUnionRequest.Bar.InlineType1.builder()
                        .foo("foo")
                        .bar(GetUndiscriminatedUnionRequest.Bar.InlineType1.Bar_.builder()
                                .foo("foo")
                                .ref(ReferenceType.builder().foo("foo").build())
                                .build())
                        .ref(ReferenceType.builder().foo("foo").build())
                        .build()))
                .foo("foo")
                .build());
    }
}
