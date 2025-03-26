using NUnit.Framework;
using SeedAliasExtends;

namespace SeedAliasExtends.Test.Unit.MockServer;

[TestFixture]
public class ExtendedInlineRequestBodyTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
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
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.ExtendedInlineRequestBodyAsync(
                    new InlinedChildRequest { Child = "child" },
                    RequestOptions
                )
        );
    }
}
