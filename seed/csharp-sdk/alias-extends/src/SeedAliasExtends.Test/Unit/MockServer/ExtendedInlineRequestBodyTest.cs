using NUnit.Framework;
using SeedAliasExtends;
using SeedAliasExtends.Test.Unit.MockServer;

#nullable enable

namespace SeedAliasExtends.Test;

[TestFixture]
public class ExtendedInlineRequestBodyTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "child": "string",
              "parent": "string"
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
                    new InlinedChildRequest { Child = "string", Parent = "string" },
                    RequestOptions
                )
        );
    }
}
