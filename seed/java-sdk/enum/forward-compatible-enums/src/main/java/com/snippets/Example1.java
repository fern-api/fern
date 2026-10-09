package com.snippets;

import com.seed._enum.SeedEnumClient;
import com.seed._enum.resources.inlinedrequest.requests.SendEnumInlinedRequest;
import com.seed._enum.types.Color;
import com.seed._enum.types.ColorOrOperand;
import com.seed._enum.types.Operand;

public class Example1 {
    public static void main(String[] args) {
        SeedEnumClient client =
                SeedEnumClient.builder().url("https://api.fern.com").build();

        client.inlinedRequest()
                .send(SendEnumInlinedRequest.builder()
                        .operand(Operand.GREATER_THAN)
                        .operandOrColor(ColorOrOperand.of(Color.RED))
                        .build());
    }
}
