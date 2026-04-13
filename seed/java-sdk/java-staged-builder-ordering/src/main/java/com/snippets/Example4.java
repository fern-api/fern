package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.service.requests.ComplexStaged;

public class Example4 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.service()
                .createcomplex(ComplexStaged.builder()
                        .fieldA("fieldA")
                        .fieldB(1)
                        .fieldC(true)
                        .fieldD("fieldD")
                        .fieldE(1.1)
                        .build());
    }
}
