using NUnit.Framework;
using SeedTrace.Test.Wire;
using SeedTrace;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class StoreTracedTestCaseTest : BaseWireTest
{
    [Test]
    public void WireTest() {
        const string requestJson = """
        {
          "result": {
            "result": {},
            "stdout": "string"
          },
          "traceResponses": [
            {
              "submissionId": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
              "lineNumber": 1,
              "returnValue": {
                "type": "integerValue"
              },
              "expressionLocation": {},
              "stack": {},
              "stdout": "string"
            }
          ]
        }
        """;


        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/admin/store-test-trace/submission/d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32/testCase/string").UsingPost().WithBody(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        );

        Assert.DoesNotThrow(() => Client.Admin.StoreTracedTestCaseAsync(d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32, "string", new StoreTracedTestCaseRequest{ 
                Result = new TestCaseResultWithStdout{ 
                    Result = new TestCaseResult(
                        
                    ), Stdout = "string"
                }, TraceResponses = new List<TraceResponse>() {
                    new TraceResponse{ 
                        SubmissionId = d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32, LineNumber = 1, ReturnValue = 1, ExpressionLocation = new ExpressionLocation(
                            
                        ), Stack = new StackInformation(
                            
                        ), Stdout = "string"
                    }}
            }).GetAwaiter().GetResult());}

}
