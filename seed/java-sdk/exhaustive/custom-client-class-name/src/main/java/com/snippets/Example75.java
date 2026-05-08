package com.snippets;

import com.seed.api.Best;
import com.seed.api.resources.endpoints.params.requests.GetWithPathAndQueryParamsRequest;

public class Example75 {
    public static void main(String[] args) {
        Best client =
                Best.builder().token("<token>").url("https://api.fern.com").build();

        client.endpoints()
                .params()
                .getWithPathAndQuery(GetWithPathAndQueryParamsRequest.builder()
                        .param("param")
                        .query("query")
                        .build());
    }
}
