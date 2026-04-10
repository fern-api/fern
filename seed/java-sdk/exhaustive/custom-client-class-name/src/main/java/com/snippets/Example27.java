package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointshttpmethods.requests.EndpointsHttpMethodsTestDeleteRequest;

public class Example27 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsHttpMethods()
                .endpointsHttpMethodsTestDelete(
                        EndpointsHttpMethodsTestDeleteRequest.builder().id("id").build());
    }
}
