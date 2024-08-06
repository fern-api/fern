using NUnit.Framework;
using SeedTrace.Test.Wire;

#nullable enable

namespace SeedTrace.Test;

[TestFixture]
public class UpdateWorkspaceSubmissionStatusTest : BaseWireTest
{
    [Test]
    public void WireTest() {
        const string requestJson = """
        {
          "type": "stopped"
        }
        """;


        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/admin/store-workspace-submission-status/d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").UsingPost().WithBody(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        );

        Assert.DoesNotThrow(() => Client.Admin.UpdateWorkspaceSubmissionStatusAsync(d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32, "no-properties-union").GetAwaiter().GetResult());}

}
