using global::System.Threading.Tasks;
using SeedTrace;

namespace Usage;

public class Example5
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Admin.StoreTracedTestCaseAsync(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            "testCaseId",
            new StoreTracedTestCaseRequest{
                Result = new TestCaseResultWithStdout{
                    Result = new TestCaseResult{
                        ExpectedResult = new Dictionary<string, object>() {
                            ["type"] = "integerValue",
                            ["value"] = 1,
                        },
                        ActualResult = new Dictionary<string, object>() {
                            ["type"] = "value",
                            ["value"] = new Dictionary<string, object>() {
                                ["type"] = "integerValue",
                                ["value"] = 1,
                            },
                        },
                        Passed = true
                    },
                    Stdout = "stdout"
                },
                TraceResponses = new List<TraceResponse>(){
                    new TraceResponse{
                        SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                        LineNumber = 1,
                        ReturnValue = new Dictionary<string, object>() {
                            ["type"] = "integerValue",
                            ["value"] = 1,
                        },
                        ExpressionLocation = new ExpressionLocation{
                            Start = 1,
                            Offset = 1
                        },
                        Stack = new StackInformation{
                            NumStackFrames = 1,
                            TopStackFrame = new StackFrame{
                                MethodName = "methodName",
                                LineNumber = 1,
                                Scopes = new List<Scope>(){
                                    new Scope{
                                        Variables = new Dictionary<string, object>(){
                                            ["variables"] = new Dictionary<string, object>() {
                                                ["type"] = "integerValue",
                                                ["value"] = 1,
                                            },
                                        }
                                    },
                                    new Scope{
                                        Variables = new Dictionary<string, object>(){
                                            ["variables"] = new Dictionary<string, object>() {
                                                ["type"] = "integerValue",
                                                ["value"] = 1,
                                            },
                                        }
                                    },
                                }
                            }
                        },
                        Stdout = "stdout"
                    },
                    new TraceResponse{
                        SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                        LineNumber = 1,
                        ReturnValue = new Dictionary<string, object>() {
                            ["type"] = "integerValue",
                            ["value"] = 1,
                        },
                        ExpressionLocation = new ExpressionLocation{
                            Start = 1,
                            Offset = 1
                        },
                        Stack = new StackInformation{
                            NumStackFrames = 1,
                            TopStackFrame = new StackFrame{
                                MethodName = "methodName",
                                LineNumber = 1,
                                Scopes = new List<Scope>(){
                                    new Scope{
                                        Variables = new Dictionary<string, object>(){
                                            ["variables"] = new Dictionary<string, object>() {
                                                ["type"] = "integerValue",
                                                ["value"] = 1,
                                            },
                                        }
                                    },
                                    new Scope{
                                        Variables = new Dictionary<string, object>(){
                                            ["variables"] = new Dictionary<string, object>() {
                                                ["type"] = "integerValue",
                                                ["value"] = 1,
                                            },
                                        }
                                    },
                                }
                            }
                        },
                        Stdout = "stdout"
                    },
                }
            }
        );
    }

}
