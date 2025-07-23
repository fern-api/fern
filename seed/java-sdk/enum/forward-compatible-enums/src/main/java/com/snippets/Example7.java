package com.snippets;

import com.seed.enum.SeedEnumClient;
import com.seed.enum.resources.queryparam.requests.SendEnumListAsQueryParamRequest;
import com.seed.enum.types.Color;
import com.seed.enum.types.ColorOrOperand;
import com.seed.enum.types.Operand;
import java.util.ArrayList;
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
                    new ArrayList<Operand>(
                        Arrays.asList(Operand.GREATER_THAN)
                    )
                )
                .maybeOperand(
                    new ArrayList<Optional<Operand>>(
                        Arrays.asList(Operand.GREATER_THAN)
                    )
                )
                .operandOrColor(
                    new ArrayList<ColorOrOperand>(
                        Arrays.asList(
                            ColorOrOperand.ofColor(Color.RED)
                        )
                    )
                )
                .maybeOperandOrColor(
                    new ArrayList<Optional<ColorOrOperand>>(
                        Arrays.asList(
                            ColorOrOperand.ofColor(Color.RED)
                        )
                    )
                )
                .build()
        );
    }
}