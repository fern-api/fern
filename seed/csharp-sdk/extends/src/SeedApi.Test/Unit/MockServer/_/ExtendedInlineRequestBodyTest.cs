using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer._;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ExtendedInlineRequestBodyTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
    {
        const string requestJson = """
            {
              "unique": "unique",
              "name": "name",
              "docs": "docs"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/extends/extended-inline-request-body")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client._.ExtendedInlineRequestBodyAsync(
                new ExtendedInlineRequestBodyRequest
                {
                    Unique = "unique",
                    Name = "name",
                    Docs = "docs",
                }
            )
        );
    }

    [NUnit.Framework.Test]
    public void MockServerTest_2()
    {
        const string requestJson = """
            {
              "docs": "docs",
              "name": "name",
              "unique": "unique"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/extends/extended-inline-request-body")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client._.ExtendedInlineRequestBodyAsync(
                new ExtendedInlineRequestBodyRequest
                {
                    Docs = "docs",
                    Name = "name",
                    Unique = "unique",
                }
            )
        );
    }
}
