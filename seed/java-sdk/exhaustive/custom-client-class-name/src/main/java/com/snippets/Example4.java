package com.snippets;

import com.seed.api.Best;
import java.util.Arrays;

public class Example4 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsContainer().endpointsContainerGetAndReturnSetOfPrimitives(Arrays.asList("string"));
    }
}
