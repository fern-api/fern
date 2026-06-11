package com.snippets;

import com.seed._enum.SeedEnumClient;
import com.seed._enum.types.Color;
import com.seed._enum.types.ColorOrOperand;
import com.seed._enum.types.Operand;

public class Example4 {
    public static void main(String[] args) {
        SeedEnumClient client =
                SeedEnumClient.builder().url("https://api.fern.com").build();

        client.pathParam().send(Operand.GREATER_THAN, ColorOrOperand.of(Color.RED));
    }
}
