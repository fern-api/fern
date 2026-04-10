package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.resources.problem.requests.ProblemGetDefaultStarterFilesRequest;
import com.seed.api.types.VariableType;
import com.seed.api.types.VariableTypeAndName;
import com.seed.api.types.VariableTypeZero;
import com.seed.api.types.VariableTypeZeroType;
import java.util.Arrays;

public class Example43 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.problem()
                .getdefaultstarterfiles(ProblemGetDefaultStarterFilesRequest.builder()
                        .outputType(VariableType.of(VariableTypeZero.builder()
                                .type(VariableTypeZeroType.INTEGER_TYPE)
                                .build()))
                        .methodName("methodName")
                        .inputParams(Arrays.asList(
                                VariableTypeAndName.builder()
                                        .variableType(VariableType.of(VariableTypeZero.builder()
                                                .type(VariableTypeZeroType.INTEGER_TYPE)
                                                .build()))
                                        .name("name")
                                        .build(),
                                VariableTypeAndName.builder()
                                        .variableType(VariableType.of(VariableTypeZero.builder()
                                                .type(VariableTypeZeroType.INTEGER_TYPE)
                                                .build()))
                                        .name("name")
                                        .build()))
                        .build());
    }
}
