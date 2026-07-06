using NUnit.Framework;
using SeedExhaustive;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Test.Utils;

namespace SeedExhaustive.Test.Unit.MockServer.InlinedRequests;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class PostWithArrayBodyAndHeadersTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            [
              "string",
              "string"
            ]
            """;

        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/req-bodies/array-body-with-headers")
                    .WithHeader("X-Custom-Header", "X-Custom-Header")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.InlinedRequests.PostWithArrayBodyAndHeadersAsync(
            new PostWithArrayBodyAndHeaders
            {
                XCustomHeader = "X-Custom-Header",
                Body = new List<string>() { "string", "string" },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
