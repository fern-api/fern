using SeedTrace;

namespace Usage;

public class Example7
{
    public async Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Admin.StoreTracedWorkspaceAsync(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            new StoreTracedWorkspaceRequest {
                WorkspaceRunDetails = new WorkspaceRunDetails {
                    ExceptionV2 = new ExceptionV2(
                        new ExceptionInfo {
                            ExceptionType = "exceptionType",
                            ExceptionMessage = "exceptionMessage",
                            ExceptionStacktrace = "exceptionStacktrace"
                        }
                    ),
                    Exception = new ExceptionInfo {
                        ExceptionType = "exceptionType",
                        ExceptionMessage = "exceptionMessage",
                        ExceptionStacktrace = "exceptionStacktrace"
                    },
                    Stdout = "stdout"
                },
                TraceResponses = new List<TraceResponse>(){
                    new TraceResponse {
                        SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                        LineNumber = 1,
                        ReturnValue = new DebugVariableValue(
                            new DebugVariableValue.IntegerValue()
                        ),
                        ExpressionLocation = new ExpressionLocation {
                            Start = 1,
                            Offset = 1
                        },
                        Stack = new StackInformation {
                            NumStackFrames = 1,
                            TopStackFrame = new StackFrame {
                                MethodName = "methodName",
                                LineNumber = 1,
                                Scopes = new List<Scope>(){
                                    new Scope {
                                        Variables = new Dictionary<string, DebugVariableValue>(){
                                            ["variables"] = new DebugVariableValue(
                                                new DebugVariableValue.IntegerValue()
                                            ),
                                        }

                                    },
                                    new Scope {
                                        Variables = new Dictionary<string, DebugVariableValue>(){
                                            ["variables"] = new DebugVariableValue(
                                                new DebugVariableValue.IntegerValue()
                                            ),
                                        }

                                    },
                                }

                            }
                        },
                        Stdout = "stdout"
                    },
                    new TraceResponse {
                        SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                        LineNumber = 1,
                        ReturnValue = new DebugVariableValue(
                            new DebugVariableValue.IntegerValue()
                        ),
                        ExpressionLocation = new ExpressionLocation {
                            Start = 1,
                            Offset = 1
                        },
                        Stack = new StackInformation {
                            NumStackFrames = 1,
                            TopStackFrame = new StackFrame {
                                MethodName = "methodName",
                                LineNumber = 1,
                                Scopes = new List<Scope>(){
                                    new Scope {
                                        Variables = new Dictionary<string, DebugVariableValue>(){
                                            ["variables"] = new DebugVariableValue(
                                                new DebugVariableValue.IntegerValue()
                                            ),
                                        }

                                    },
                                    new Scope {
                                        Variables = new Dictionary<string, DebugVariableValue>(){
                                            ["variables"] = new DebugVariableValue(
                                                new DebugVariableValue.IntegerValue()
                                            ),
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
