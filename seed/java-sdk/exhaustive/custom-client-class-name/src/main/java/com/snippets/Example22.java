package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointshttpmethods.requests.EndpointsHttpMethodsTestGetRequest;

public class Example22 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsHttpMethods()
                .endpointsHttpMethodsTestGet(
                        EndpointsHttpMethodsTestGetRequest.builder().id("id").build());
    }
}
