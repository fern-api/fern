package com.snippets;

import com.seed.enum.SeedEnumClient;
import com.seed.enum.resources.queryparam.requests.SendEnumAsQueryParamRequest;
import com.seed.enum.types.Color;
import com.seed.enum.types.ColorOrOperand;
import com.seed.enum.types.Operand;

public class Example6 {
    public static void main(String[] args) {
        SeedEnumClient client = SeedEnumClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.queryParam().send(
            SendEnumAsQueryParamRequest
                .builder()
                .operand(Operand.GREATER_THAN)
                .operandOrColor(
                    ColorOrOperand.ofColor(Color.RED)
                )
                .maybeOperand(Operand.GREATER_THAN)
                .maybeOperandOrColor(
                    ColorOrOperand.ofColor(Color.RED)
                )
                .build()
        );
    }
}