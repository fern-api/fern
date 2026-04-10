package com.snippets;

import com.fern.sdk.SeedExhaustiveClient;
import com.fern.sdk.resources.types.object.types.ObjectWithUnknownField;
import java.util.HashMap;

public class Example23 {
    public static void main(String[] args) {
        SeedExhaustiveClient client = SeedExhaustiveClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.endpoints().object().getAndReturnWithUnknownField(
            ObjectWithUnknownField
                .builder()
                .unknown(new 
                    HashMap<String, Object>() {{put("key", "value");
                    }})
                .build()
        );
    }
}