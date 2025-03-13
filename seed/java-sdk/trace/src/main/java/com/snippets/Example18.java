package com.snippets;

import com.seed.trace.SeedTraceClient;
import com.seed.trace.resources.commons.types.FileInfo;
import com.seed.trace.resources.commons.types.Language;
import com.seed.trace.resources.commons.types.TestCase;
import com.seed.trace.resources.commons.types.TestCaseWithExpectedResult;
import com.seed.trace.resources.commons.types.VariableType;
import com.seed.trace.resources.commons.types.VariableValue;
import com.seed.trace.resources.problem.types.CreateProblemRequest;
import com.seed.trace.resources.problem.types.ProblemDescription;
import com.seed.trace.resources.problem.types.ProblemDescriptionBoard;
import com.seed.trace.resources.problem.types.ProblemFiles;
import com.seed.trace.resources.problem.types.VariableTypeAndName;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

public class Example18 {
    public static void run() {
        SeedTraceClient client = SeedTraceClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.problem().updateProblem(
            "problemId",
            CreateProblemRequest
                .builder()
                .problemName("problemName")
                .problemDescription(
                    ProblemDescription
                        .builder()
                        .boards(
                            new ArrayList<ProblemDescriptionBoard>(
                                Arrays.asList(
                                    ProblemDescriptionBoard.html(),
                                    ProblemDescriptionBoard.html()
                                )
                            )
                        )
                        .build()
                )
                .files(
                    new HashMap<Language, ProblemFiles>() {{
                        put(Language.JAVA, ProblemFiles
                            .builder()
                            .solutionFile(
                                FileInfo
                                    .builder()
                                    .filename("filename")
                                    .contents("contents")
                                    .build()
                            )
                            .readOnlyFiles(
                                new ArrayList<FileInfo>(
                                    Arrays.asList(
                                        FileInfo
                                            .builder()
                                            .filename("filename")
                                            .contents("contents")
                                            .build(),
                                        FileInfo
                                            .builder()
                                            .filename("filename")
                                            .contents("contents")
                                            .build()
                                    )
                                )
                            )
                            .build());
                    }}
                )
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
                .testcases(
                    new ArrayList<TestCaseWithExpectedResult>(
                        Arrays.asList(
                            TestCaseWithExpectedResult
                                .builder()
                                .testCase(
                                    TestCase
                                        .builder()
                                        .id("id")
                                        .params(
                                            new ArrayList<VariableValue>(
                                                Arrays.asList(
                                                    VariableValue.integerValue(),
                                                    VariableValue.integerValue()
                                                )
                                            )
                                        )
                                        .build()
                                )
                                .expectedResult(
                                    VariableValue.integerValue()
                                )
                                .build(),
                            TestCaseWithExpectedResult
                                .builder()
                                .testCase(
                                    TestCase
                                        .builder()
                                        .id("id")
                                        .params(
                                            new ArrayList<VariableValue>(
                                                Arrays.asList(
                                                    VariableValue.integerValue(),
                                                    VariableValue.integerValue()
                                                )
                                            )
                                        )
                                        .build()
                                )
                                .expectedResult(
                                    VariableValue.integerValue()
                                )
                                .build()
                        )
                    )
                )
                .methodName("methodName")
                .build()
        );
    }
}