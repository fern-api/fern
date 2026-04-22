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
import java.util.Arrays;
import java.util.HashMap;

public class Example21 {
    public static void main(String[] args) {
        SeedTraceClient client = SeedTraceClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.problem()
                .updateProblem(
                        "problemId",
                        CreateProblemRequest.builder()
                                .problemName("problemName")
                                .problemDescription(ProblemDescription.builder()
                                        .boards(Arrays.asList(
                                                ProblemDescriptionBoard.html("boards"),
                                                ProblemDescriptionBoard.html("boards")))
                                        .build())
                                .outputType(VariableType.integerType())
                                .methodName("methodName")
                                .files(new HashMap<Language, ProblemFiles>() {
                                    {
                                        put(
                                                Language.JAVA,
                                                ProblemFiles.builder()
                                                        .solutionFile(FileInfo.builder()
                                                                .filename("filename")
                                                                .contents("contents")
                                                                .build())
                                                        .readOnlyFiles(Arrays.asList(
                                                                FileInfo.builder()
                                                                        .filename("filename")
                                                                        .contents("contents")
                                                                        .build(),
                                                                FileInfo.builder()
                                                                        .filename("filename")
                                                                        .contents("contents")
                                                                        .build()))
                                                        .build());
                                    }
                                })
                                .inputParams(Arrays.asList(
                                        VariableTypeAndName.builder()
                                                .variableType(VariableType.integerType())
                                                .name("name")
                                                .build(),
                                        VariableTypeAndName.builder()
                                                .variableType(VariableType.integerType())
                                                .name("name")
                                                .build()))
                                .testcases(Arrays.asList(
                                        TestCaseWithExpectedResult.builder()
                                                .testCase(TestCase.builder()
                                                        .id("id")
                                                        .params(Arrays.asList(
                                                                VariableValue.integerValue(1),
                                                                VariableValue.integerValue(1)))
                                                        .build())
                                                .expectedResult(VariableValue.integerValue(1))
                                                .build(),
                                        TestCaseWithExpectedResult.builder()
                                                .testCase(TestCase.builder()
                                                        .id("id")
                                                        .params(Arrays.asList(
                                                                VariableValue.integerValue(1),
                                                                VariableValue.integerValue(1)))
                                                        .build())
                                                .expectedResult(VariableValue.integerValue(1))
                                                .build()))
                                .build());
    }
}
