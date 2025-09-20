package com.snippets;

import com.seed.object.SeedObjectClient;
import com.seed.object.requests.GetUndiscriminatedUnionRequest;
import com.seed.object.types.ReferenceType;
import com.seed.object.types.UndiscriminatedUnion1;
import com.seed.object.types.UndiscriminatedUnion1InlineType1;
import com.seed.object.types.UndiscriminatedUnion1InlineType1InlineType1;

public class Example2 {
    public static void main(String[] args) {
        SeedObjectClient client = SeedObjectClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.getUndiscriminatedUnion(
            GetUndiscriminatedUnionRequest
                .builder()
                .bar(
                    UndiscriminatedUnion1.of(
                        UndiscriminatedUnion1InlineType1
                            .builder()
                            .foo("foo")
                            .bar(
                                UndiscriminatedUnion1InlineType1InlineType1
                                    .builder()
                                    .foo("foo")
                                    .ref(
                                        ReferenceType
                                            .builder()
                                            .foo("foo")
                                            .build()
                                    )
                                    .build()
                            )
                            .ref(
                                ReferenceType
                                    .builder()
                                    .foo("foo")
                                    .build()
                            )
                            .build()
                    )
                )
                .foo("foo")
                .build()
        );
    }
}