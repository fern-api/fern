package com.snippets;

import com.fern.sdk.SeedApiClient;
import com.fern.sdk.types.TypesObjectWithUnknownField;
import java.util.HashMap;

public class Example55 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().getAndReturnWithUnknownField(
            TypesObjectWithUnknownField
                .builder()
                .unknown(new 
                    HashMap<String, Object>() {{put("key", "value");
                    }})
                .build()
        );
    }
}