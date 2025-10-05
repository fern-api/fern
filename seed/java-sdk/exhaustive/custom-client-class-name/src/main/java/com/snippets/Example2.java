package com.snippets;

import com.seed.exhaustive.Best;
import java.util.Arrays;
import java.util.HashSet;

public class Example2 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints().container().getAndReturnSetOfPrimitives(new HashSet<String>(Arrays.asList("string")));
    }
}
