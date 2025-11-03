using NUnit.Framework;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.Test_.Unit.MockServer;

[TestFixture]
public class GetExecutionSessionTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "sessionId": "sessionId",
              "executionSessionUrl": "executionSessionUrl",
              "language": "JAVA",
              "status": "CREATING_CONTAINER"
            }
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/sessions/sessionId").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Submission.GetExecutionSessionAsync("sessionId");
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<ExecutionSessionResponse?>(mockResponse))
                .UsingDefaults()
        );
    }
}
