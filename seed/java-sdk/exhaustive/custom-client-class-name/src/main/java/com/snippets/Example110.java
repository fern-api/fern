package com.snippets;

import com.seed.api.Best;
import java.util.HashMap;

public class Example110 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.noauth().postwithnoauth(new HashMap<String, Object>() {
            {
                put("key", "value");
            }
        });
    }
}
