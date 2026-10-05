using NUnit.Framework;
using SeedErrors;
using SeedErrors.Test.Unit.MockServer;
using SeedErrors.Test.Utils;

namespace SeedErrors.Test.Unit.MockServer.Simple;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class FooTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "bar": "bar"
            }
            """;

        const string mockResponse = """
            {
              "bar": "bar"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/foo2")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Simple.FooAsync(new FooRequest { Bar = "bar" });
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsFooTooMuch()
    {
        const string requestJson = """
            {
              "bar": "bar"
            }
            """;

        const string mockResponse = """
            {
              "message": "message",
              "code": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/foo2")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(429)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<FooTooMuch>(async () =>
            await Client.Simple.FooAsync(new FooRequest { Bar = "bar" })
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(429));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsFooTooLittle()
    {
        const string requestJson = """
            {
              "bar": "bar"
            }
            """;

        const string mockResponse = """
            {
              "message": "message",
              "code": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/foo2")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(500)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<FooTooLittle>(async () =>
            await Client.Simple.FooAsync(new FooRequest { Bar = "bar" })
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(500));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsNotFoundError()
    {
        const string requestJson = """
            {
              "bar": "bar"
            }
            """;

        const string mockResponse = """
            {
              "message": "message",
              "code": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/foo2")
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
            await Client.Simple.FooAsync(new FooRequest { Bar = "bar" })
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(404));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsBadRequestError()
    {
        const string requestJson = """
            {
              "bar": "bar"
            }
            """;

        const string mockResponse = """
            {
              "message": "message",
              "code": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/foo2")
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
            await Client.Simple.FooAsync(new FooRequest { Bar = "bar" })
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(400));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }
}
