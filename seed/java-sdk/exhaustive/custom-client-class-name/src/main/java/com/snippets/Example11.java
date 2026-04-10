package com.snippets;

import com.seed.api.Best;
import com.seed.api.types.TypesObjectWithRequiredField;
import java.util.HashMap;

public class Example11 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsContainer()
                .endpointsContainerGetAndReturnMapOfPrimToObject(new HashMap<String, TypesObjectWithRequiredField>() {
                    {
                        put(
                                "string",
                                TypesObjectWithRequiredField.builder()
                                        .string("string")
                                        .build());
                    }
                });
    }
}
