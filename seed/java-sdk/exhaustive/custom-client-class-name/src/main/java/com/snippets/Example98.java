package com.snippets;

import com.seed.api.Best;

public class Example98 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsUrLs().endpointsUrlsWithMixedCase();
    }
}
