package com.snippets;

import com.seed._enum.SeedEnumClient;
import com.seed._enum.resources.queryparam.requests.SendEnumListAsQueryParamRequest;
import com.seed._enum.types.Color;
import com.seed._enum.types.ColorOrOperand;
import com.seed._enum.types.Operand;
import java.util.Arrays;

public class Example7 {
    public static void main(String[] args) {
        SeedEnumClient client =
                SeedEnumClient.builder().url("https://api.fern.com").build();

        client.queryParam()
                .sendList(SendEnumListAsQueryParamRequest.builder()
                        .operand(Arrays.asList(Operand.GREATER_THAN))
                        .maybeOperand(Arrays.asList(Operand.GREATER_THAN))
                        .operandOrColor(Arrays.asList(ColorOrOperand.of(Color.RED)))
                        .maybeOperandOrColor(Arrays.asList(ColorOrOperand.of(Color.RED)))
                        .build());
    }
}
