package com.snippets;

import com.seed.api.Best;
import java.util.HashMap;

public class Example19 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints().container().getAndReturnMapPrimToPrim(new HashMap<String, String>() {
            {
                put("key", "value");
            }
        });
    }
}
