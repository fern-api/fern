package com.snippets;

import com.seed.api.SeedApiClient;
import com.seed.api.types.CreateProblemRequest;
import com.seed.api.types.FileInfo;
import com.seed.api.types.ProblemDescription;
import com.seed.api.types.ProblemDescriptionBoard;
import com.seed.api.types.ProblemDescriptionBoardHtml;
import com.seed.api.types.ProblemFiles;
import com.seed.api.types.TestCase;
import com.seed.api.types.TestCaseWithExpectedResult;
import com.seed.api.types.VariableType;
import com.seed.api.types.VariableTypeAndName;
import com.seed.api.types.VariableTypeZero;
import com.seed.api.types.VariableTypeZeroType;
import com.seed.api.types.VariableValue;
import com.seed.api.types.VariableValueZero;
import com.seed.api.types.VariableValueZeroType;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example37 {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient.builder()
                .token("<token>")
                .url("https://api.fern.com")
                .build();

        client.problem()
                .createproblem(CreateProblemRequest.builder()
                        .problemName("problemName")
                        .problemDescription(ProblemDescription.builder()
                                .boards(Arrays.asList(
                                        ProblemDescriptionBoard.html(ProblemDescriptionBoardHtml.builder()
                                                .value("value")
                                                .build()),
                                        ProblemDescriptionBoard.html(ProblemDescriptionBoardHtml.builder()
                                                .value("value")
                                                .build())))
                                .build())
                        .outputType(VariableType.of(VariableTypeZero.builder()
                                .type(VariableTypeZeroType.INTEGER_TYPE)
                                .build()))
                        .methodName("methodName")
                        .files(new HashMap<String, ProblemFiles>() {
                            {
                                put(
                                        "files",
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
                        .testcases(Arrays.asList(
                                TestCaseWithExpectedResult.builder()
                                        .testCase(TestCase.builder()
                                                .id("id")
                                                .params(Arrays.asList(
                                                        VariableValue.of(VariableValueZero.builder()
                                                                .type(VariableValueZeroType.INTEGER_VALUE)
                                                                .value(Optional.of(1))
                                                                .build()),
                                                        VariableValue.of(VariableValueZero.builder()
                                                                .type(VariableValueZeroType.INTEGER_VALUE)
                                                                .value(Optional.of(1))
                                                                .build())))
                                                .build())
                                        .expectedResult(VariableValue.of(VariableValueZero.builder()
                                                .type(VariableValueZeroType.INTEGER_VALUE)
                                                .value(Optional.of(1))
                                                .build()))
                                        .build(),
                                TestCaseWithExpectedResult.builder()
                                        .testCase(TestCase.builder()
                                                .id("id")
                                                .params(Arrays.asList(
                                                        VariableValue.of(VariableValueZero.builder()
                                                                .type(VariableValueZeroType.INTEGER_VALUE)
                                                                .value(Optional.of(1))
                                                                .build()),
                                                        VariableValue.of(VariableValueZero.builder()
                                                                .type(VariableValueZeroType.INTEGER_VALUE)
                                                                .value(Optional.of(1))
                                                                .build())))
                                                .build())
                                        .expectedResult(VariableValue.of(VariableValueZero.builder()
                                                .type(VariableValueZeroType.INTEGER_VALUE)
                                                .value(Optional.of(1))
                                                .build()))
                                        .build()))
                        .build());
    }
}
