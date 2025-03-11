package com.snippets;

import com.seed.trace.SeedTraceClient;
import com.seed.trace.resources.commons.types.VariableType;
import com.seed.trace.resources.problem.requests.GetDefaultStarterFilesRequest;
import com.seed.trace.resources.problem.types.VariableTypeAndName;
import java.util.ArrayList;
import java.util.Arrays;

public class Example20 {
    public static void run() {
        SeedTraceClient client = SeedTraceClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.problem().getDefaultStarterFiles(
            GetDefaultStarterFilesRequest
                .builder()
                .inputParams(
                    new ArrayList<VariableTypeAndName>(
                        Arrays.asList(
                            VariableTypeAndName
                                .builder()
                                .variableType(
                                    VariableType.integerType()
                                )
                                .name("name")
                                .build(),
                            VariableTypeAndName
                                .builder()
                                .variableType(
                                    VariableType.integerType()
                                )
                                .name("name")
                                .build()
                        )
                    )
                )
                .outputType(
                    VariableType.integerType()
                )
                .methodName("methodName")
                .build()
        );
    }
}