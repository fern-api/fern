package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.union.requests.UnionTestCamelCasePropertiesRequest;
import com.seed.api.types.PaymentMethodUnion;
import com.seed.api.types.TokenizeCard;

public class Example13 {
    public static void main(String[] args) {
        SeedApiClient client =
                SeedApiClient.builder().url("https://api.fern.com").build();

        client.union()
                .testcamelcaseproperties(UnionTestCamelCasePropertiesRequest.builder()
                        .paymentMethod(PaymentMethodUnion.of(TokenizeCard.builder()
                                .method("method")
                                .cardNumber("cardNumber")
                                .build()))
                        .build());
    }
}
