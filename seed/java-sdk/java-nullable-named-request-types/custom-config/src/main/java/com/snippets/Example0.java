package com.snippets;

import com.seed.api.Foo;
import com.seed.api.requests.PostWithNullableNamedRequestBodyTypeRequest;
import com.seed.api.types.NullableObject;

public class Example0 {
    public static void main(String[] args) {
        Foo client = Foo
            .builder()
            .url("https://api.fern.com")
            .build();

        client.postWithNullableNamedRequestBodyType(
            PostWithNullableNamedRequestBodyTypeRequest
                .builder()
                .id("id")
                .body(
                    NullableObject
                        .builder()
                        .id("id")
                        .name("name")
                        .age(1)
                        .build()
                )
                .build()
        );
    }
}