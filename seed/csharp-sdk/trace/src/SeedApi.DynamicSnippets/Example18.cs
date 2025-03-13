using global::System.Threading.Tasks;
using SeedTrace;

namespace Usage;

public class Example18
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Problem.UpdateProblemAsync(
            "problemId",
            new CreateProblemRequest{
                ProblemName = "problemName",
                ProblemDescription = new ProblemDescription{
                    Boards = new List<object>(){
                        new Dictionary<string, object>() {
                            ["type"] = "html",
                            ["value"] = "boards",
                        },
                        new Dictionary<string, object>() {
                            ["type"] = "html",
                            ["value"] = "boards",
                        },
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
                        VariableType = new Dictionary<string, object>() {
                            ["type"] = "integerType",
                        },
                        Name = "name"
                    },
                    new VariableTypeAndName{
                        VariableType = new Dictionary<string, object>() {
                            ["type"] = "integerType",
                        },
                        Name = "name"
                    },
                },
                OutputType = new Dictionary<string, object>() {
                    ["type"] = "integerType",
                },
                Testcases = new List<TestCaseWithExpectedResult>(){
                    new TestCaseWithExpectedResult{
                        TestCase = new TestCase{
                            Id = "id",
                            Params = new List<object>(){
                                new Dictionary<string, object>() {
                                    ["type"] = "integerValue",
                                    ["value"] = 1,
                                },
                                new Dictionary<string, object>() {
                                    ["type"] = "integerValue",
                                    ["value"] = 1,
                                },
                            }
                        },
                        ExpectedResult = new Dictionary<string, object>() {
                            ["type"] = "integerValue",
                            ["value"] = 1,
                        }
                    },
                    new TestCaseWithExpectedResult{
                        TestCase = new TestCase{
                            Id = "id",
                            Params = new List<object>(){
                                new Dictionary<string, object>() {
                                    ["type"] = "integerValue",
                                    ["value"] = 1,
                                },
                                new Dictionary<string, object>() {
                                    ["type"] = "integerValue",
                                    ["value"] = 1,
                                },
                            }
                        },
                        ExpectedResult = new Dictionary<string, object>() {
                            ["type"] = "integerValue",
                            ["value"] = 1,
                        }
                    },
                },
                MethodName = "methodName"
            }
        );
    }

}
