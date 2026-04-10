package com.snippets;

import com.seed.api.Best;

public class Example88 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsPrimitive().endpointsPrimitiveGetAndReturnDate("2023-01-15");
    }
}
