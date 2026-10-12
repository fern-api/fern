using NUnit.Framework;
using SeedApi.Folder;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Folder.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnknownRequestTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "key": "value"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/service")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Folder.Service.UnknownRequestAsync(
                new Dictionary<object, object?>() { { "key", "value" } }
            )
        );
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsNotFoundError()
    {
        const string requestJson = """
            {
              "key": "value"
            }
            """;

        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/service")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(404)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<NotFoundError>(async () =>
            await Client.Folder.Service.UnknownRequestAsync(
                new Dictionary<object, object?>() { { "key", "value" } }
            )
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(404));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }
}
