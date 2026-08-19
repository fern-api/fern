using NUnit.Framework;
using SeedTrace;
using SeedTrace.Test_.Unit.MockServer;
using SeedTrace.Test_.Utils;

namespace SeedTrace.Test_.Unit.MockServer.Submission;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateExecutionSessionTest : BaseMockServerTest
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
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/sessions/create-session/JAVA")
                    .UsingPost()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Submission.CreateExecutionSessionAsync(Language.Java);
        JsonAssert.AreEqual(response, mockResponse);
    }
}
