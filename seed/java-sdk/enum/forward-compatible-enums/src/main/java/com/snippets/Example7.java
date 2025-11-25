package com.snippets;

import com.seed.enum.SeedEnumClient;
import com.seed.enum.resources.queryparam.requests.SendEnumListAsQueryParamRequest;
import com.seed.enum.types.Color;
import com.seed.enum.types.ColorOrOperand;
import com.seed.enum.types.Operand;
import java.util.Arrays;
import java.util.Optional;

public class Example7 {
    public static void main(String[] args) {
        SeedEnumClient client = SeedEnumClient
            .builder()
            .url("https://api.fern.com")
            .build();

        client.queryParam().sendList(
            SendEnumListAsQueryParamRequest
                .builder()
                .operand(
                    Arrays.asList(Operand.GREATER_THAN)
                )
                .maybeOperand(
                    Arrays.asList(Optional.of(Operand.GREATER_THAN))
                )
                .operandOrColor(
                    Arrays.asList(
                        ColorOrOperand.of(Color.RED)
                    )
                )
                .maybeOperandOrColor(
                    Arrays.asList(
                        Optional.of(
                            ColorOrOperand.of(Color.RED)
                        )
                    )
                )
                .build()
        );
    }
}