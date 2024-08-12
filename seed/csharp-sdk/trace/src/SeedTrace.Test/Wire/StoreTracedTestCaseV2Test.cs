using NUnit.Framework;
using SeedTrace;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class StoreTracedTestCaseV2Test : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            [
              {
                "submissionId": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                "lineNumber": 1,
                "file": {},
                "returnValue": {
                  "type": "integerValue"
                },
                "expressionLocation": {},
                "stack": {},
                "stdout": "string"
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath(
                        "/admin/store-test-trace-v2/submission/d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32/testCase/string"
                    )
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrow(
            () =>
                Client
                    .Admin.StoreTracedTestCaseV2Async(
                        "this.internalType.value.toString()",
                        "string",
                        new List<TraceResponseV2>()
                        {
                            new TraceResponseV2
                            {
                                SubmissionId = "this.internalType.value.toString()",
                                LineNumber = 1,
                                File = new TracedFile(),
                                ReturnValue = 1,
                                ExpressionLocation = new ExpressionLocation(),
                                Stack = new StackInformation(),
                                Stdout = "string"
                            }
                        }
                    )
                    .GetAwaiter()
                    .GetResult()
        );
    }
}
