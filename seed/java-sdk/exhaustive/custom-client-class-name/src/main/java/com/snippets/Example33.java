package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpoints.httpmethods.requests.TestGetHttpMethodsRequest;

public class Example33 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .httpMethods()
                .testGet(TestGetHttpMethodsRequest.builder().id("id").build());
    }
}
