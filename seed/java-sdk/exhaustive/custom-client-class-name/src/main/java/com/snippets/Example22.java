package com.snippets;

import com.seed.exhaustive.Best;
import com.seed.exhaustive.resources.types.object.types.ObjectWithUnknownField;
import java.util.HashMap;

public class Example22 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .object()
                .getAndReturnWithUnknownField(ObjectWithUnknownField.builder()
                        .unknown(new HashMap<String, Object>() {
                            {
                                put("$ref", "https://example.com/schema");
                            }
                        })
                        .build());
    }
}
