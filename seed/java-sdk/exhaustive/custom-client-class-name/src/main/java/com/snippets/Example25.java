package com.snippets;

import com.seed.exhaustive.Best;
import java.util.HashMap;

public class Example25 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints().object().getAndReturnMapOfDocumentedUnknownType(new HashMap<String, Object>() {
            {
                put("string", new HashMap<String, Object>() {
                    {
                        put("key", "value");
                    }
                });
            }
        });
    }
}
