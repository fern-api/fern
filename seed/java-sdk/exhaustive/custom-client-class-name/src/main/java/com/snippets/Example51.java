package com.snippets;

import com.seed.exhaustive.Best;
import java.util.HashMap;

public class Example51 {
    public static void main(String[] args) {
        Best client = Best
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.noAuth().postWithNoAuth(new 
        HashMap<String, Object>() {{put("key", "value");
        }});
    }
}