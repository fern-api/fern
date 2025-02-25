using FluentAssertions.Json;
using global::System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class CreateExecutionSessionTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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

        var response = await Client.Submission.CreateExecutionSessionAsync(
            Language.Java,
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
