package com.snippets;

import com.seed.trace.SeedTraceClient;
import com.seed.trace.resources.commons.types.VariableType;
import com.seed.trace.resources.problem.requests.GetDefaultStarterFilesRequest;
import com.seed.trace.resources.problem.types.VariableTypeAndName;
import java.util.Arrays;

public class Example23 {
    public static void main(String[] args) {
        SeedTraceClient client = SeedTraceClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.problem()
                .getDefaultStarterFiles(GetDefaultStarterFilesRequest.builder()
                        .outputType(VariableType.integerType())
                        .methodName("methodName")
                        .inputParams(Arrays.asList(
                                VariableTypeAndName.builder()
                                        .variableType(VariableType.integerType())
                                        .name("name")
                                        .build(),
                                VariableTypeAndName.builder()
                                        .variableType(VariableType.integerType())
                                        .name("name")
                                        .build()))
                        .build());
    }
}
