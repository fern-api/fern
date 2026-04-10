package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceSearchResourcesRequest;
import java.util.HashMap;

public class Example5 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.service()
                .searchresources(ServiceSearchResourcesRequest.builder()
                        .limit(1)
                        .offset(1)
                        .query("query")
                        .filters(new HashMap<String, Object>() {
                            {
                                put("filters", new HashMap<String, Object>() {
                                    {
                                        put("key", "value");
                                    }
                                });
                            }
                        })
                        .build());
    }
}
