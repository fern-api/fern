package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointsparams.requests.EndpointsParamsGetWithQueryRequest;

public class Example65 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsParams()
                .endpointsParamsGetWithQuery(EndpointsParamsGetWithQueryRequest.builder()
                        .query("query")
                        .number(1)
                        .build());
    }
}
