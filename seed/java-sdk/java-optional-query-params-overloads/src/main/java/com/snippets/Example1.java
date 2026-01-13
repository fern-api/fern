package com.snippets;

import com.seed.javaOptionalQueryParamsOverloads.SeedJavaOptionalQueryParamsOverloadsClient;
import com.seed.javaOptionalQueryParamsOverloads.requests.SearchPoliciesRequest;

public class Example1 {
    public static void main(String[] args) {
        SeedJavaOptionalQueryParamsOverloadsClient client = SeedJavaOptionalQueryParamsOverloadsClient.builder()
                .url("https://api.fern.com")
                .build();

        client.searchPolicies(
                SearchPoliciesRequest.builder().query("query").limit(1).build());
    }
}
