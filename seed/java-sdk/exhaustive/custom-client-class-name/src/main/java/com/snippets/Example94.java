package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointsput.requests.EndpointsPutAddRequest;

public class Example94 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsPut()
                .endpointsPutAdd(EndpointsPutAddRequest.builder().id("id").build());
    }
}
