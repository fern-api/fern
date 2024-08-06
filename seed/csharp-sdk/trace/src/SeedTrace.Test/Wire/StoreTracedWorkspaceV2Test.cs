using NUnit.Framework;
using SeedTrace.Test.Wire;
using SeedTrace;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class StoreTracedWorkspaceV2Test : BaseWireTest
{
    [Test]
    public void WireTest() {
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


        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/admin/store-workspace-trace-v2/submission/d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").UsingPost().WithBody(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        );

        Assert.DoesNotThrow(() => Client.Admin.StoreTracedWorkspaceV2Async(d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32, new List<TraceResponseV2>() {
                new TraceResponseV2{ 
                    SubmissionId = d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32, LineNumber = 1, File = new TracedFile(
                        
                    ), ReturnValue = 1, ExpressionLocation = new ExpressionLocation(
                        
                    ), Stack = new StackInformation(
                        
                    ), Stdout = "string"
                }}).GetAwaiter().GetResult());}

}
