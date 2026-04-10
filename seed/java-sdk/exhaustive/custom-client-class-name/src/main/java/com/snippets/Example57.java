package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointsparams.requests.EndpointsParamsGetWithPathRequest;

public class Example57 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsParams()
                .endpointsParamsGetWithPath(EndpointsParamsGetWithPathRequest.builder()
                        .param("param")
                        .build());
    }
}
