package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpoints.httpmethods.requests.TestDeleteHttpMethodsRequest;

public class Example38 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .httpMethods()
                .testDelete(TestDeleteHttpMethodsRequest.builder().id("id").build());
    }
}
