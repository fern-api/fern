using NUnit.Framework;
using SeedBasicAuth;
using SeedBasicAuth.Test.Unit.MockServer;
using SeedBasicAuth.Test.Utils;

namespace SeedBasicAuth.Test.Unit.MockServer.BasicAuth;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetWithBasicAuthTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            true
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/basic-auth").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.BasicAuth.GetWithBasicAuthAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsUnauthorizedRequest()
    {
        const string mockResponse = """
            {
              "message": "message"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/basic-auth").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(401)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<UnauthorizedRequest>(async () =>
            await Client.BasicAuth.GetWithBasicAuthAsync()
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(401));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }
}
