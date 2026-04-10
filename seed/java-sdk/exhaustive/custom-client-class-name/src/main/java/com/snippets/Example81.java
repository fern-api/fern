package com.snippets;

import com.seed.api.Best;

public class Example81 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsPrimitive().endpointsPrimitiveGetAndReturnLong(1000000L);
    }
}
