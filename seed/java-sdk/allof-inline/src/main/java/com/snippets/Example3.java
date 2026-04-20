package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.RuleCreateRequest;
import com.seed.api.types.RuleExecutionContext;

public class Example3 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.createRule(RuleCreateRequest.builder()
                .name("name")
                .executionContext(RuleExecutionContext.PROD)
                .build());
    }
}
