package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.unknown.requests.MyObject;
import java.util.HashMap;

public class Example1 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.unknown()
                .postobject(MyObject.builder()
                        .unknown(new HashMap<String, Object>() {
                            {
                                put("key", "value");
                            }
                        })
                        .build());
    }
}
