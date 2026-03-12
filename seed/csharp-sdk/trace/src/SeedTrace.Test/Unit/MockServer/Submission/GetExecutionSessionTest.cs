using NUnit.Framework;
using SeedTrace.Test_.Unit.MockServer;
using SeedTrace.Test_.Utils;

namespace SeedTrace.Test_.Unit.MockServer.Submission;

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
        JsonAssert.AreEqual(response, mockResponse);
    }
}
