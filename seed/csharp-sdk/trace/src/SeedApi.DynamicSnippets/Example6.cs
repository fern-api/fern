using SeedTrace;

namespace Usage;

public class Example6
{
    public async Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Admin.StoreTracedTestCaseV2Async(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            "testCaseId",
            new List<TraceResponseV2>(){
                new TraceResponseV2 {
                    SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    LineNumber = 1,
                    File = new TracedFile {
                        Filename = "filename",
                        Directory = "directory"
                    },
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
                new TraceResponseV2 {
                    SubmissionId = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                    LineNumber = 1,
                    File = new TracedFile {
                        Filename = "filename",
                        Directory = "directory"
                    },
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
        );
    }

}
