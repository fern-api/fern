package com.fern.test;

import com.fern.HttpRequest;
import com.fern.NamedTypeReference;
import com.fern.TypeReference;

public class Main {

    public static void main(String... args) {
        HttpRequest.builder()
                .bodyType(TypeReference.named(NamedTypeReference.builder()
                        .name("")
                        .build()))
                .build();
    }
}
