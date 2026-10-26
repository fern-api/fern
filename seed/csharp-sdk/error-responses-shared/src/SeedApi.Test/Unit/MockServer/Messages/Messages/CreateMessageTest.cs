using NUnit.Framework;
using SeedApi.Messages;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Messages.Messages;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateMessageTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "sid": "sid",
              "body": "body"
            }
            """;

        const string mockResponse = """
            {
              "sid": "sid",
              "body": "body"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/messages")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Messages.Messages.CreateMessageAsync(
            new Message { Sid = "sid", Body = "body" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "sid": "sid",
              "body": "body"
            }
            """;

        const string mockResponse = """
            {
              "sid": "sid",
              "body": "body"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/messages")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Messages.Messages.CreateMessageAsync(
            new Message { Sid = "sid", Body = "body" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
