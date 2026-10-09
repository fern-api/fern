using NUnit.Framework;
using SeedServerSentEvents;
using SeedServerSentEvents.Test.Unit.MockServer;
using SeedServerSentEvents.Test.Utils;

namespace SeedServerSentEvents.Test.Unit.MockServer.Completions;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class StreamTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsBadRequestError()
    {
        const string requestJson = """
            {
              "query": ""
            }
            """;

        const string mockResponse = """
            "bad request"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/stream")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(400)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<BadRequestError>(async () =>
        {
            await foreach (
                var item in Client.Completions.StreamAsync(
                    new StreamCompletionRequest { Query = "" }
                )
            )
            {
                /* consume each item */
            }
        })!;
        Assert.That(exception.StatusCode, Is.EqualTo(400));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }
}
