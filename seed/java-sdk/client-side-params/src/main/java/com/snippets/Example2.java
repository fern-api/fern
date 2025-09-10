package com.snippets;

import com.seed.clientSideParams.SeedClientSideParamsClient;
import com.seed.clientSideParams.resources.service.requests.SearchResourcesRequest;
import java.util.HashMap;

public class Example2 {
    public static void main(String[] args) {
        SeedClientSideParamsClient client = SeedClientSideParamsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.service().searchResources(
            SearchResourcesRequest
                .builder()
                .limit(1)
                .offset(1)
                .query("query")
                .filters(
                    new HashMap<String, Object>() {{
                        put("filters", new 
                        HashMap<String, Object>() {{put("key", "value");
                        }});
                    }}
                )
                .build()
        );
    }
}