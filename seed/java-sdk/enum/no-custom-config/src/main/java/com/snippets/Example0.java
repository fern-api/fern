package com.snippets;

import com.seed.enum.SeedEnumClient;
import com.seed.enum.resources.headers.requests.SendEnumAsHeaderRequest;
import com.seed.enum.types.Color;
import com.seed.enum.types.ColorOrOperand;
import com.seed.enum.types.Operand;

public class Example0 {
    public static void main(String[] args) {
        SeedEnumClient client = SeedEnumClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.headers().send(
            SendEnumAsHeaderRequest
                .builder()
                .operand(Operand.GREATER_THAN)
                .operandOrColor(
                    ColorOrOperand.ofColor(Color.RED)
                )
                .maybeOperand(Operand.GREATER_THAN)
                .build()
        );
    }
}