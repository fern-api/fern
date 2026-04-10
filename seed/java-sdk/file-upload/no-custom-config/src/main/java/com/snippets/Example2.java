package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ServiceJustFileWithOptionalQueryParamsRequest;

public class Example2 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .justfilewithoptionalqueryparams(
                        ServiceJustFileWithOptionalQueryParamsRequest.builder().build());
    }
}
