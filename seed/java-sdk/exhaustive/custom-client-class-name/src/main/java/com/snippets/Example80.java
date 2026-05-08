package com.snippets;

import com.seed.api.Best;

public class Example80 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints().primitive().getAndReturnString("string");
    }
}
