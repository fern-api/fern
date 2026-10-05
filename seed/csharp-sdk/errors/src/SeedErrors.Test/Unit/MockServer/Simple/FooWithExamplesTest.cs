using NUnit.Framework;
using SeedErrors;
using SeedErrors.Test.Unit.MockServer;
using SeedErrors.Test.Utils;

namespace SeedErrors.Test.Unit.MockServer.Simple;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class FooWithExamplesTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "bar": "hello"
            }
            """;

        const string mockResponse = """
            {
              "bar": "hello"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/foo3")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Simple.FooWithExamplesAsync(new FooRequest { Bar = "hello" });
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsFooTooMuch()
    {
        const string requestJson = """
            {
              "bar": "hello"
            }
            """;

        const string mockResponse = """
            {
              "message": "Too much foo",
              "code": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/foo3")
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
            await Client.Simple.FooWithExamplesAsync(new FooRequest { Bar = "hello" })
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(429));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsFooTooLittle()
    {
        const string requestJson = """
            {
              "bar": "hello"
            }
            """;

        const string mockResponse = """
            {
              "message": "Too little foo",
              "code": 2
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/foo3")
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
            await Client.Simple.FooWithExamplesAsync(new FooRequest { Bar = "hello" })
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(500));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }
}
