using global::System.Threading.Tasks;
using SeedTrace;
using SeedTrace.Core;

namespace Usage;

public class Example7
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Admin.StoreTracedWorkspaceAsync(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            new StoreTracedWorkspaceRequest{
                WorkspaceRunDetails = new WorkspaceRunDetails{
                    ExceptionV2 = new Dictionary<string, object>() {
                        ["type"] = "generic",
                        ["exceptionType"] = "exceptionType",
                        ["exceptionMessage"] = "exceptionMessage",
                        ["exceptionStacktrace"] = "exceptionStacktrace",
                    },
                    Exception = new ExceptionInfo{
                        ExceptionType = "exceptionType",
                        ExceptionMessage = "exceptionMessage",
                        ExceptionStacktrace = "exceptionStacktrace"
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
