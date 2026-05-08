package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpoints.params.requests.GetWithAllowMultipleQueryParamsRequest;
import java.util.Arrays;

public class Example74 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .params()
                .getWithAllowMultipleQuery(GetWithAllowMultipleQueryParamsRequest.builder()
                        .query(Arrays.asList("query"))
                        .number(Arrays.asList(1))
                        .build());
    }
}
