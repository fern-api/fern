package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesObjectWithUnknownField;
import java.util.HashMap;

public class Example44 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpointsObject().endpointsObjectGetAndReturnWithUnknownField(
            TypesObjectWithUnknownField
                .builder()
                .unknown(new 
                    HashMap<String, Object>() {{put("key", "value");
                    }})
                .build()
        );
    }
}