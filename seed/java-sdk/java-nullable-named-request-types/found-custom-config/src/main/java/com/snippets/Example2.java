package com.snippets;

import com.seed.api.Foo;
import com.seed.api.requests.NonNullableObject;

public class Example2 {
    public static void main(String[] args) {
        Foo client = Foo
            .builder()
            .url("https://api.fern.com")
            .build();

        client.postWithNonNullableNamedRequestBodyType(
            NonNullableObject
                .builder()
                .id("id")
                .nonNullableObjectId("id")
                .name("name")
                .age(1)
                .build()
        );
    }
}