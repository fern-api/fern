using NUnit.Framework;
using SeedAccept;
using SeedAccept.Test.Unit.MockServer;
using SeedAccept.Test.Utils;

namespace SeedAccept.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/container/").UsingDelete())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.Service.EndpointAsync());
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsNotFoundError()
    {
        const string mockResponse = """
            {
              "key": "value"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/container/").UsingDelete())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(404)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<NotFoundError>(async () =>
            await Client.Service.EndpointAsync()
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(404));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }
}
