package com.snippets;

import com.seed.api.Best;

public class Example85 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsPrimitive().endpointsPrimitiveGetAndReturnBool(true);
    }
}
