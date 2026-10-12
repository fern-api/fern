using NUnit.Framework;
using SeedBasicAuthPwOmitted;
using SeedBasicAuthPwOmitted.Test.Unit.MockServer;
using SeedBasicAuthPwOmitted.Test.Utils;

namespace SeedBasicAuthPwOmitted.Test.Unit.MockServer.BasicAuth;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class PostWithBasicAuthTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "key": "value"
            }
            """;

        const string mockResponse = """
            true
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/basic-auth")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.BasicAuth.PostWithBasicAuthAsync(
            new Dictionary<object, object?>() { { "key", "value" } }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsUnauthorizedRequest()
    {
        const string requestJson = """
            {
              "key": "value"
            }
            """;

        const string mockResponse = """
            {
              "message": "message"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/basic-auth")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(401)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<UnauthorizedRequest>(async () =>
            await Client.BasicAuth.PostWithBasicAuthAsync(
                new Dictionary<object, object?>() { { "key", "value" } }
            )
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(401));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsBadRequest()
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
                    .WithPath("/basic-auth")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock.ResponseBuilders.Response.Create().WithStatusCode(400).WithBody("{}")
            );

        var exception = Assert.ThrowsAsync<BadRequest>(async () =>
            await Client.BasicAuth.PostWithBasicAuthAsync(
                new Dictionary<object, object?>() { { "key", "value" } }
            )
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(400));
    }
}
