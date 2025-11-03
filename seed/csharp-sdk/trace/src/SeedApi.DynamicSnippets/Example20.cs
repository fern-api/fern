using SeedTrace;

namespace Usage;

public class Example20
{
    public async Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Problem.CreateProblemAsync(
            new CreateProblemRequest {
                ProblemName = "problemName",
                ProblemDescription = new ProblemDescription {
                    Boards = new List<ProblemDescriptionBoard>(){
                        new ProblemDescriptionBoard(
                            new ProblemDescriptionBoard.Html("html")
                        ),
                        new ProblemDescriptionBoard(
                            new ProblemDescriptionBoard.Html("html")
                        ),
                    }

                },
                Files = new Dictionary<Language, ProblemFiles>(){
                    [Language.Java] = new ProblemFiles {
                        SolutionFile = new SeedTrace.FileInfo {
                            Filename = "filename",
                            Contents = "contents"
                        },
                        ReadOnlyFiles = new List<SeedTrace.FileInfo>(){
                            new SeedTrace.FileInfo {
                                Filename = "filename",
                                Contents = "contents"
                            },
                            new SeedTrace.FileInfo {
                                Filename = "filename",
                                Contents = "contents"
                            },
                        }

                    },
                }
                ,
                InputParams = new List<VariableTypeAndName>(){
                    new VariableTypeAndName {
                        VariableType = new VariableType(
                            new VariableType.IntegerType()
                        ),
                        Name = "name"
                    },
                    new VariableTypeAndName {
                        VariableType = new VariableType(
                            new VariableType.IntegerType()
                        ),
                        Name = "name"
                    },
                }
                ,
                OutputType = new VariableType(
                    new VariableType.IntegerType()
                ),
                Testcases = new List<TestCaseWithExpectedResult>(){
                    new TestCaseWithExpectedResult {
                        TestCase = new TestCase {
                            Id = "id",
                            Params = new List<VariableValue>(){
                                new VariableValue(
                                    new VariableValue.IntegerValue()
                                ),
                                new VariableValue(
                                    new VariableValue.IntegerValue()
                                ),
                            }

                        },
                        ExpectedResult = new VariableValue(
                            new VariableValue.IntegerValue()
                        )
                    },
                    new TestCaseWithExpectedResult {
                        TestCase = new TestCase {
                            Id = "id",
                            Params = new List<VariableValue>(){
                                new VariableValue(
                                    new VariableValue.IntegerValue()
                                ),
                                new VariableValue(
                                    new VariableValue.IntegerValue()
                                ),
                            }

                        },
                        ExpectedResult = new VariableValue(
                            new VariableValue.IntegerValue()
                        )
                    },
                }
                ,
                MethodName = "methodName"
            }
        );
    }

}
