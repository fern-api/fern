package com.snippets;

import com.seed.javaOptionalQueryParamsOverloads.SeedJavaOptionalQueryParamsOverloadsClient;
import com.seed.javaOptionalQueryParamsOverloads.requests.UserGetLatestInsuranceRequest;
import com.seed.javaOptionalQueryParamsOverloads.types.PolicyType;

public class Example0 {
    public static void main(String[] args) {
        SeedJavaOptionalQueryParamsOverloadsClient client = SeedJavaOptionalQueryParamsOverloadsClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.getLatestInsurance(
            "userId",
            UserGetLatestInsuranceRequest
                .builder()
                .includeExpired(true)
                .policyType(PolicyType.HEALTH)
                .build()
        );
    }
}