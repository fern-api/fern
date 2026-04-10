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
              "child": "child",
              "parent": "parent"
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
                new ExtendedInlineRequestBodyRequest { Child = "child", Parent = "parent" }
            )
        );
    }

    [NUnit.Framework.Test]
    public void MockServerTest_2()
    {
        const string requestJson = """
            {
              "parent": "parent",
              "child": "child"
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
                new ExtendedInlineRequestBodyRequest { Parent = "parent", Child = "child" }
            )
        );
    }
}
