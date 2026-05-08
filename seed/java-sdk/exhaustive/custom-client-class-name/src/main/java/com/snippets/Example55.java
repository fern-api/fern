package com.snippets;

import com.seed.api.Best;
import com.seed.api.types.TypesObjectWithUnknownField;
import java.util.HashMap;

public class Example55 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .object()
                .getAndReturnWithUnknownField(TypesObjectWithUnknownField.builder()
                        .unknown(new HashMap<String, Object>() {
                            {
                                put("key", "value");
                            }
                        })
                        .build());
    }
}
