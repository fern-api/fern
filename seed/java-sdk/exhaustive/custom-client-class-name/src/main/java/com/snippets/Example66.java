package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpointsparams.requests.EndpointsParamsGetWithAllowMultipleQueryRequest;
import java.util.Arrays;

public class Example66 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpointsParams()
                .endpointsParamsGetWithAllowMultipleQuery(EndpointsParamsGetWithAllowMultipleQueryRequest.builder()
                        .query(Arrays.asList("query"))
                        .number(Arrays.asList(1))
                        .build());
    }
}
