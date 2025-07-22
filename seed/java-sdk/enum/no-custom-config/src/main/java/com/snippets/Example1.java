package com.snippets;

import com.seed.enum.SeedEnumClient;
import com.seed.enum.resources.inlinedrequest.requests.SendEnumInlinedRequest;
import com.seed.enum.types.Color;
import com.seed.enum.types.ColorOrOperand;
import com.seed.enum.types.Operand;

public class Example1 {
    public static void main(String[] args) {
        SeedEnumClient client = SeedEnumClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.inlinedRequest().send(
            SendEnumInlinedRequest
                .builder()
                .operand(Operand.GREATER_THAN)
                .operandOrColor(
                    ColorOrOperand.ofColor(Color.RED)
                )
                .build()
        );
    }
}