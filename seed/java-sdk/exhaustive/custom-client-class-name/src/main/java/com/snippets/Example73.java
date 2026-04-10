package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointsparams.requests.EndpointsParamsGetWithPathAndErrorsRequest;

public class Example73 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsParams()
                .endpointsParamsGetWithPathAndErrors(EndpointsParamsGetWithPathAndErrorsRequest.builder()
                        .param("param")
                        .build());
    }
}
