package com.snippets;

import com.seed.api.Best;
import com.seed.api.types.TypesMixedType;
import java.util.HashMap;

public class Example12 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsContainer()
                .endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion(new HashMap<String, TypesMixedType>() {
                    {
                        put("key", TypesMixedType.of(1.1));
                    }
                });
    }
}
