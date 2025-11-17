package com.snippets;

import com.seed.undiscriminatedUnions.SeedUndiscriminatedUnionsClient;
import com.seed.undiscriminatedUnions.resources.union.requests.PaymentRequest;
import com.seed.undiscriminatedUnions.resources.union.types.PaymentMethodUnion;
import com.seed.undiscriminatedUnions.resources.union.types.TokenizeCard;

public class Example9 {
    public static void main(String[] args) {
        SeedUndiscriminatedUnionsClient client = SeedUndiscriminatedUnionsClient.builder()
                .url("https://api.fern.com")
                .build();

        client.union()
                .testCamelCaseProperties(PaymentRequest.builder()
                        .paymentMethod(PaymentMethodUnion.of(TokenizeCard.builder()
                                .method("method")
                                .cardNumber("cardNumber")
                                .build()))
                        .build());
    }
}
