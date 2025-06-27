using global::System.Threading.Tasks;
using SeedTrace;

namespace Usage;

public class Example17
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Problem.CreateProblemAsync(
            new CreateProblemRequest{
                ProblemName = "problemName",
                ProblemDescription = new ProblemDescription{
                    Boards = new List<ProblemDescriptionBoard>(){
                        new ProblemDescriptionBoard(

                        ),
                        new ProblemDescriptionBoard(

                        ),
                    }
                },
                Files = new Dictionary<Language, ProblemFiles>(){
                    [Language.Java] = new ProblemFiles{
                        SolutionFile = new FileInfo{
                            Filename = "filename",
                            Contents = "contents"
                        },
                        ReadOnlyFiles = new List<FileInfo>(){
                            new FileInfo{
                                Filename = "filename",
                                Contents = "contents"
                            },
                            new FileInfo{
                                Filename = "filename",
                                Contents = "contents"
                            },
                        }
                    },
                },
                InputParams = new List<VariableTypeAndName>(){
                    new VariableTypeAndName{
                        VariableType = new VariableType(),
                        Name = "name"
                    },
                    new VariableTypeAndName{
                        VariableType = new VariableType(),
                        Name = "name"
                    },
                },
                OutputType = new VariableType(),
                Testcases = new List<TestCaseWithExpectedResult>(){
                    new TestCaseWithExpectedResult{
                        TestCase = new TestCase{
                            Id = "id",
                            Params = new List<VariableValue>(){
                                new VariableValue(

                                ),
                                new VariableValue(

                                ),
                            }
                        },
                        ExpectedResult = new VariableValue(

                        )
                    },
                    new TestCaseWithExpectedResult{
                        TestCase = new TestCase{
                            Id = "id",
                            Params = new List<VariableValue>(){
                                new VariableValue(

                                ),
                                new VariableValue(

                                ),
                            }
                        },
                        ExpectedResult = new VariableValue(

                        )
                    },
                },
                MethodName = "methodName"
            }
        );
    }

}
