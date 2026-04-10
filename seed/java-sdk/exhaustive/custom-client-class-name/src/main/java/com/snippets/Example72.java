package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointsparams.requests.EndpointsParamsGetWithBooleanPathRequest;

public class Example72 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsParams()
                .endpointsParamsGetWithBooleanPath(EndpointsParamsGetWithBooleanPathRequest.builder()
                        .param(true)
                        .build());
    }
}
